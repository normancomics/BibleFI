import { supabase } from "@/integrations/supabase/client";
import { realSuperfluidClient } from "@/integrations/superfluid/realClient";

export interface SuperfluidStreamData {
  id: string;
  stream_id: string;
  receiver_address: string;
  token_address: string;
  token_symbol: string;
  flow_rate: string;
  stream_type: 'tithe' | 'staking' | 'general';
  church_id?: string;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  start_date: string;
  end_date?: string;
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

export const SuperfluidService = {
  /**
   * Get all streams for the current user
   */
  async getUserStreams(): Promise<SuperfluidStreamData[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('superfluid_streams')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user streams:", error);
      throw error;
    }

    return (data || []) as SuperfluidStreamData[];
  },

  /**
   * Get streams by type
   */
  async getStreamsByType(type: 'tithe' | 'staking' | 'general'): Promise<SuperfluidStreamData[]> {
    const streams = await this.getUserStreams();
    return streams.filter(stream => stream.stream_type === type);
  },

  /**
   * Update stream status
   */
  async updateStreamStatus(streamId: string, status: 'active' | 'paused' | 'cancelled' | 'completed'): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('superfluid_streams')
      .update({ status })
      .eq('id', streamId)
      .eq('user_id', session.session.user.id);

    if (error) {
      console.error("Error updating stream status:", error);
      throw error;
    }
  },

  /**
   * Calculate monthly flow amount from flow rate
   */
  calculateMonthlyAmount(flowRate: string): number {
    const flowRateNumber = parseFloat(flowRate);
    const secondsInMonth = 30 * 24 * 60 * 60;
    return (flowRateNumber * secondsInMonth) / 1e18; // Convert from wei to token units
  },

  /**
   * Get stream details with real-time data
   */
  async getStreamWithRealTimeData(stream: SuperfluidStreamData) {
    try {
      // Initialize Superfluid client
      await realSuperfluidClient.initialize();
      
      // Get real-time flow data
      const flowData = await realSuperfluidClient.getFlow(
        stream.receiver_address, // This should be sender in real implementation
        stream.receiver_address,
        stream.token_address
      );

      return {
        ...stream,
        realTimeFlowRate: flowData?.flowRate || stream.flow_rate,
        deposit: flowData?.deposit || '0',
        owedDeposit: flowData?.owedDeposit || '0'
      };
    } catch (error) {
      console.error("Error getting real-time stream data:", error);
      return stream;
    }
  },

  /**
   * Delete a stream
   */
  async deleteStream(streamId: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("User not authenticated");
    }

    // First update status to cancelled
    await this.updateStreamStatus(streamId, 'cancelled');
    
    // TODO: In a real implementation, also cancel the actual Superfluid stream
    // This would require calling realSuperfluidClient.deleteFlow()
  }
};
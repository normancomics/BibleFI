import React from 'react';
import ProductionTithingInterface from '@/components/tithe/ProductionTithingInterface';

const TithePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <ProductionTithingInterface />
      </div>
    </div>
  );
};
import { useToast } from "@/hooks/use-toast";
import TitheAndShare from "@/components/tithe/TitheAndShare";
import AddChurchForm from "@/components/tithe/AddChurchForm";
import FarcasterFrame from "@/components/farcaster/FarcasterFrame";
import { useFarcasterAuth } from "@/farcaster/auth";
import { getUserChurches } from "@/services/churchService";
import { supabase } from "@/integrations/supabase/client";
import { Church as ChurchType } from "@/types/church";
import SuperfluidTithe from "@/components/tithe/SuperfluidTithe";
import TithingDashboard from "@/components/tithe/TithingDashboard";
import CBDCEducation from "@/components/education/CBDCEducation";
import { Heart, BarChart3, Zap, AlertTriangle } from "lucide-react";

export default TithePage;

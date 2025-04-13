
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Bible.Fi custom colors - more vibrant retro game colors
				scripture: {
					DEFAULT: '#FF44FF', // Bright neon pink
					dark: '#BB00BB',    // Darker pink
					light: '#FFB3FF',   // Light pink
				},
				ancient: {
					scroll: '#FFFF00',  // Bright retro yellow
					gold: '#FFAA00',    // Gold orange for important elements
					temple: '#00FF66',  // Bright green for temple elements
				},
				// Retro game colors
				pixel: {
					red: '#FF0000',
					blue: '#0088FF',
					green: '#00FF00',
					yellow: '#FFFF00',
					orange: '#FF8800',
					pink: '#FF44FF',
					cyan: '#00FFFF',
					purple: '#8800FF',
					black: '#000000',
					white: '#FFFFFF',
				},
				base: {
					blue: '#0052FF', // Base chain blue
					dark: '#003399',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'coin-spin': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(360deg)' }
				},
				'scroll-unfurl': {
					'0%': { transform: 'scaleY(0)' },
					'100%': { transform: 'scaleY(1)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(255, 68, 255, 0.5))' },
					'50%': { filter: 'drop-shadow(0 0 20px rgba(255, 68, 255, 0.8))' }
				},
				'pixel-shift': {
					'0%, 100%': { transform: 'translate(0, 0)' },
					'10%': { transform: 'translate(-2px, 0)' },
					'20%': { transform: 'translate(2px, 0)' },
					'30%': { transform: 'translate(-2px, 0)' },
					'40%': { transform: 'translate(2px, 0)' },
					'50%': { transform: 'translate(0, 0)' }
				},
				'scanline': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'coin-spin': 'coin-spin 2s ease-in-out infinite',
				'scroll-unfurl': 'scroll-unfurl 0.5s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'pixel-shift': 'pixel-shift 5s ease-in-out infinite',
				'scanline': 'scanline 8s linear infinite'
			},
			fontFamily: {
				pixel: ['VT323', 'monospace'],
				scroll: ['Cinzel', 'serif'],
				game: ['"Press Start 2P"', 'cursive']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

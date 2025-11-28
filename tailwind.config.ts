
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
				// eBoy-inspired bright colors
				eboy: {
					yellow: 'hsl(var(--eboy-yellow))',
					green: 'hsl(var(--eboy-green))',
					pink: 'hsl(var(--eboy-pink))',
					blue: 'hsl(var(--eboy-blue))',
					red: 'hsl(var(--eboy-red))',
					orange: 'hsl(var(--eboy-orange))',
					purple: 'hsl(var(--eboy-purple))',
					cyan: 'hsl(var(--eboy-cyan))',
				},
				// Biblical theme colors - bright like eBoy
				scripture: {
					DEFAULT: 'hsl(var(--scripture))',
					light: 'hsl(var(--scripture-light))',
					dark: 'hsl(var(--scripture-dark))',
				},
				'ancient-gold': 'hsl(var(--ancient-gold))',
				'ancient-scroll': 'hsl(var(--ancient-scroll))',
				ancient: {
					gold: 'hsl(var(--ancient-gold))',
					scroll: 'hsl(var(--ancient-scroll))',
				},
				pixel: {
					purple: 'hsl(var(--pixel-purple))',
					green: 'hsl(var(--pixel-green))',
					yellow: 'hsl(var(--pixel-yellow))',
				},
				'eboy-green': 'hsl(var(--eboy-green))',
				'eboy-yellow': 'hsl(var(--eboy-yellow))',
				'eboy-pink': 'hsl(var(--eboy-pink))',
				'eboy-blue': 'hsl(var(--eboy-blue))',
				'eboy-red': 'hsl(var(--eboy-red))',
				'eboy-orange': 'hsl(var(--eboy-orange))',
				'eboy-purple': 'hsl(var(--eboy-purple))',
				'eboy-cyan': 'hsl(var(--eboy-cyan))',
				base: {
					blue: 'hsl(var(--base-blue))',
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
					'0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(142, 93, 246, 0.5))' },
					'50%': { filter: 'drop-shadow(0 0 20px rgba(142, 93, 246, 0.8))' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'coin-spin': 'coin-spin 2s ease-in-out infinite',
				'scroll-unfurl': 'scroll-unfurl 0.5s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			},
			fontFamily: {
				pixel: ['VT323', 'monospace'],
				scroll: ['Cinzel', 'Playfair Display', 'serif'],
				game: ['"Press Start 2P"', 'cursive']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

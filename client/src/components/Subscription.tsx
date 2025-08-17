import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Crown, Star, CheckCircle, CreditCard, Calendar, Zap, Users, Headphones, Radio, Music, Gift, Shield } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import type { MetalTheme } from "../contexts/ThemeContext";
import { useScrollVelocity } from "../hooks/use-scroll-velocity";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";

export default function Subscription() {
  const { velocity } = useScrollVelocity();
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { currentTheme, isDarkMode } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState('basic');

  // Memoize expensive calculations
  const scrollIntensity = useMemo(() => {
    return Math.min(Math.abs(velocity) / 1000, 1);
  }, [velocity]);

  const parallaxOffset = useMemo(() => {
    return scrollIntensity * 15;
  }, [scrollIntensity]);

  // Memoize theme styles to prevent unnecessary recalculations
  const themeStyles = useMemo(() => {
    const baseStyles = {
      background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      cardBackground: isDarkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(245, 245, 245, 0.95)',
      color: isDarkMode ? '#ffffff' : '#000000',
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      accentColor: isDarkMode ? '#ff6b35' : '#e65100'
    };

    const accentColors: { [key in MetalTheme]: string } = {
      'classic-metal': isDarkMode ? '#f97316' : '#ea580c',
      'black-metal': isDarkMode ? '#000000' : '#1a1a1a',
      'death-metal': isDarkMode ? '#8b0000' : '#d32f2f',
      'power-metal': isDarkMode ? '#ffd700' : '#f57c00',
      'doom-metal': isDarkMode ? '#8b0000' : '#d32f2f',
      'thrash-metal': isDarkMode ? '#ff6b35' : '#e65100',
      'gothic-metal': isDarkMode ? '#800080' : '#9c27b0',
      'light-mode': isDarkMode ? '#f97316' : '#ea580c',
      'dark-mode': isDarkMode ? '#f97316' : '#ea580c',
      'glassmorphism-premium': isDarkMode ? '#a855f7' : '#9333ea'
    };

    // Ensure currentTheme is available before using it
    const safeCurrentTheme = currentTheme && accentColors[currentTheme] ? currentTheme : 'classic-metal';

    return {
      ...baseStyles,
      accentColor: accentColors[safeCurrentTheme] || accentColors['classic-metal']
    };
  }, [currentTheme, isDarkMode]);

  // Memoize subscription plans to prevent unnecessary re-renders
  const subscriptionPlans = useMemo(() => [
    {
      id: 'basic',
      name: 'Basic Metalhead',
      price: '$4.99',
      period: 'month',
      features: [
        'Ad-free listening experience',
        'High-quality audio streams',
        'Access to basic playlists',
        'Community chat access'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Rebel',
      price: '$9.99',
      period: 'month',
      features: [
        'Everything in Basic',
        'Exclusive metal content',
        'Priority customer support',
        'Early access to new features',
        'Custom playlist creation'
      ],
      popular: true
    },
    {
      id: 'legend',
      name: 'Legend Package',
      price: '$19.99',
      period: 'month',
      features: [
        'Everything in Premium',
        'VIP community access',
        'Exclusive merchandise discounts',
        'Direct artist interaction',
        'Behind-the-scenes content'
      ],
      popular: false
    }
  ], []);

  // Memoize the render function for subscription plans
  const renderSubscriptionPlan = useCallback((plan: typeof subscriptionPlans[0]) => (
    <div
      key={plan.id}
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
        selectedPlan === plan.id ? 'ring-4 ring-opacity-50' : ''
      }`}
      style={{
        background: plan.id === selectedPlan ? themeStyles.cardBackground : themeStyles.background,
        borderColor: plan.id === selectedPlan ? themeStyles.accentColor : themeStyles.borderColor,
        transform: `translateY(${parallaxOffset}px)`
      }}
      onClick={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && (
        <div 
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold"
          style={{ 
            background: themeStyles.accentColor,
            color: isDarkMode ? '#000000' : '#ffffff'
          }}
        >
          Most Popular
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-2" style={{ color: themeStyles.color }}>
        {plan.name}
      </h3>
      
      <div className="mb-4">
        <span className="text-4xl font-bold" style={{ color: themeStyles.accentColor }}>
          {plan.price}
        </span>
        <span className="text-lg" style={{ color: themeStyles.color }}>
          /{plan.period}
        </span>
      </div>
      
      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <span 
              className="mr-2 text-lg"
              style={{ color: themeStyles.accentColor }}
            >
              ✓
            </span>
            <span style={{ color: themeStyles.color }}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      
      <button
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-0 ${
          plan.id === selectedPlan 
            ? 'scale-105 shadow-lg' 
            : 'hover:scale-102'
        }`}
        style={{
          background: plan.id === selectedPlan ? themeStyles.accentColor : themeStyles.borderColor,
          color: plan.id === selectedPlan 
            ? (isDarkMode ? '#000000' : '#ffffff')
            : themeStyles.color
        }}
      >
        {plan.id === selectedPlan ? 'Selected' : 'Choose Plan'}
      </button>
    </div>
  ), [selectedPlan, themeStyles, parallaxOffset, isDarkMode]);

  return (
    <section
      ref={ref}
      className="py-16 px-4 min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${themeStyles.background}, ${themeStyles.background}dd)`,
        transform: `translateY(${parallaxOffset}px)`
      }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 
          className="text-5xl md:text-7xl font-bold mb-8"
          style={{ color: themeStyles.accentColor }}
        >
          Choose Your Metal Path
        </h2>
        
        <p className="text-xl mb-12 max-w-3xl mx-auto" style={{ color: themeStyles.color }}>
          Join the Spandex Salvation Radio family and unlock the ultimate metal experience. 
          Choose the plan that fits your metal lifestyle.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map(renderSubscriptionPlan)}
        </div>
        
        <div className="p-8 rounded-xl border backdrop-blur-md transition-all duration-500 hover:scale-105"
             style={{
               background: themeStyles.cardBackground,
               borderColor: themeStyles.borderColor,
               transform: `translateY(${parallaxOffset * 1.5}px)`
             }}>
          <p className="text-xl font-semibold mb-4" style={{ color: themeStyles.accentColor }}>
            Ready to Rock?
          </p>
          <p className="text-lg mb-6" style={{ color: themeStyles.color }}>
            Start your metal journey today and never miss a beat of the heaviest music on the planet.
          </p>
          <button
            className="px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-0"
            style={{
              background: themeStyles.accentColor,
              color: isDarkMode ? '#000000' : '#ffffff'
            }}
          >
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
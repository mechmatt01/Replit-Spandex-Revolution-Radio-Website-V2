import { useContext, useMemo } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
export function useAdaptiveTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAdaptiveTheme must be used within a ThemeProvider');
    }
    // Memoize the theme data to prevent unnecessary re-renders
    const themeData = useMemo(() => ({
        currentTheme: context.currentTheme,
        isDarkMode: context.isDarkMode,
        colors: context.colors,
        toggleTheme: context.toggleTheme,
        setTheme: context.setTheme,
        toggleDarkMode: context.toggleDarkMode
    }), [
        context.currentTheme,
        context.isDarkMode,
        context.colors,
        context.toggleTheme,
        context.setTheme,
        context.toggleDarkMode
    ]);
    return themeData;
}

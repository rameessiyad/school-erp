// src/components/AnimatedSplash.tsx
import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

interface AnimatedSplashProps {
  appReady: boolean;
  onHidden: () => void;
}

export function AnimatedSplash({ appReady, onHidden }: AnimatedSplashProps) {
  const { colors, fontFamily, radius } = useTheme();
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!appReady) return;
    // small minimum display time so the splash never feels like a flicker
    const timer = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onHidden();
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [appReady]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          opacity: overlayOpacity,
          zIndex: 999,
        },
      ]}
    >
      <Animated.View
        style={{
          alignItems: "center",
          gap: 14,
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      >
        <View
          style={{
            height: 64,
            width: 64,
            borderRadius: radius.xl,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="school" size={32} color={colors.primaryForeground} />
        </View>
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: 20,
            color: colors.textPrimary,
          }}
        >
          School ERP
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 13,
            color: colors.textMuted,
          }}
        >
          Teacher
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

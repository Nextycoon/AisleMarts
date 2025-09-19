import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const moods = [
  { key:"luxury", label:"Luxurious" },
  { key:"trending", label:"Trending" },
  { key:"deals", label:"Deals" },
];

interface CopilotBarProps {
  onPick: (mood: string) => void;
}

export default function CopilotBar({ onPick }: CopilotBarProps) {
  return (
    <View style={styles.container}>
      {moods.map(m => (
        <TouchableOpacity 
          key={m.key} 
          onPress={() => onPick(m.key)} 
          style={styles.moodChip}
        >
          <Text style={styles.moodText}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  moodChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    minHeight: 44, // Touch target requirement
  },
  moodText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
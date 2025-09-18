import React, { useEffect, useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface VoiceButtonProps {
  onShowCollection?: (collection: string) => void;
  onSearch?: (query: string) => void;
}

export default function VoiceButton({ onShowCollection, onSearch }: VoiceButtonProps) {
  const [listening, setListening] = useState(false);

  const handleVoiceCommand = async () => {
    setListening(true);
    
    // Simulate voice input for demo - in production, integrate with expo-speech
    const mockCommands = [
      "show me luxury bags",
      "trending shoes", 
      "find deals on accessories",
      "premium watches"
    ];
    
    const mockInput = mockCommands[Math.floor(Math.random() * mockCommands.length)];
    
    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:8000/api/ai/voice-command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: mockInput })
        });
        
        const data = await response.json();
        
        if (data.intent === "SHOW_COLLECTION") {
          onShowCollection?.(data.collection);
        } else if (data.intent === "SEARCH") {
          onSearch?.(data.query);
        }
      } catch (error) {
        console.error('Voice command failed:', error);
      } finally {
        setListening(false);
      }
    }, 2000);
  };

  return (
    <TouchableOpacity onPress={handleVoiceCommand} style={styles.container}>
      <LinearGradient
        colors={listening ? ['#a855f7', '#7c3aed'] : ['#374151', '#4b5563']}
        style={styles.gradient}
      >
        <Text style={styles.text}>
          {listening ? "🎤 Listening..." : "🎙️ Voice"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
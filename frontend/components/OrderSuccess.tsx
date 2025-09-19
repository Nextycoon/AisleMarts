import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface OrderSuccessProps {
  total: number;
}

export default function OrderSuccess({ total }: OrderSuccessProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Confirmed</Text>
      <Text style={styles.totalText}>Total paid: ${total.toFixed(2)}</Text>
      <Text style={styles.receiptText}>Receipt sent to your email</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 22,
    color: "#EBD6A0",
    marginBottom: 8,
    fontWeight: "600",
  },
  totalText: {
    color: "#fff",
    opacity: 0.8,
    fontSize: 16,
    marginBottom: 6,
  },
  receiptText: {
    color: "#9FE7F5",
    fontSize: 14,
    textAlign: "center",
  },
});
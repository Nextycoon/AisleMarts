import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";

export const PerfHUD = ({ creators, stories }: { creators:number; stories:number }) => {
  const [fps, setFps] = useState<number>(0);
  const [cache, setCache] = useState<string>("–");
  const frames = useRef(0);
  const last = useRef(global.performance?.now?.() ?? Date.now());

  useEffect(() => {
    let raf = 0, t = setInterval(() => {
      const now = global.performance?.now?.() ?? Date.now();
      const dt = now - last.current; last.current = now;
      setFps(Math.round((frames.current * 1000) / (dt || 1)));
      frames.current = 0;
      const usage = (globalThis as any).__prefetch?.cache?.usageMB?.();
      setCache(typeof usage === "number" ? `${usage}MB` : "–");
    }, 1000);
    const tick = () => { frames.current++; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearInterval(t); };
  }, []);

  return (
    <View style={{ position:"absolute", top:12, right:12, paddingHorizontal:10, paddingVertical:6, borderRadius:10, backgroundColor:"#0008" }}>
      <Text style={{ color:"#fff", fontSize:12 }}>
        {creators} Creators • {stories} Stories • Cache {cache} • {fps} fps
      </Text>
    </View>
  );
};
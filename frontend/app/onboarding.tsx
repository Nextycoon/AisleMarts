// app/onboarding.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Image, Platform, Alert } from "react-native";
import { Video } from "expo-av";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

/** ========= THEME (Luxury Cinematic) ========= */
const BRAND = {
  bg: "#000000", // Pure black for cinema
  bgGradient: "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 100%)",
  card: "#0A0A0A", // Darker cards
  cardGlass: "rgba(10, 10, 10, 0.8)", // Glass morphism
  line: "#333333", // Subtle borders
  ink: "#FFFFFF", // Pure white text
  sub: "#C0C0C0", // Lighter secondary text
  gold: "#D4AF37", // Rich gold
  goldGlow: "#FFD700", // Bright gold for accents
  goldDeep: "#B8860B", // Darker gold
  focus: "#2a2100",
  shadow: "rgba(212, 175, 55, 0.3)", // Gold shadow
};

/** ========= API CONFIG ========= */
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://api.aislemarts.com";
const PROMO_URL = "https://app.emergent.sh/chat"; // Commander's link

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${msg}`);
  }
  return res.json() as Promise<T>;
}

/** ========= UI PRIMITIVES (Luxury Cinematic) ========= */
function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => ({
        backgroundColor: disabled ? "#2a2a2a" : BRAND.gold,
        opacity: pressed ? 0.9 : 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: BRAND.goldGlow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: BRAND.goldGlow,
      })}
    >
      <Text style={{ 
        color: BRAND.bg, 
        fontWeight: "900", 
        fontSize: 18,
        letterSpacing: 0.5,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderColor: BRAND.gold,
        borderWidth: 2,
        backgroundColor: "rgba(212, 175, 55, 0.1)",
        opacity: pressed ? 0.8 : 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: BRAND.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      })}
    >
      <Text style={{ 
        color: BRAND.gold, 
        fontWeight: "800", 
        fontSize: 16,
        letterSpacing: 0.3,
      }}>{label}</Text>
    </Pressable>
  );
}
function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignSelf: "center", marginVertical: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === step ? 18 : 8,
            height: 8,
            borderRadius: 8,
            backgroundColor: i <= step ? BRAND.gold : "#333",
          }}
        />
      ))}
    </View>
  );
}
function ScreenShell({
  children, title, subtitle, step, total,
}: { children: React.ReactNode; title: string; subtitle?: string; step: number; total: number }) {
  return (
    <View style={{ flex: 1, backgroundColor: BRAND.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 28, gap: 18 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 1.6 }}>AISLEMARTS</Text>
        <Text style={{ color: BRAND.ink, fontSize: 26, fontWeight: "800" }}>{title}</Text>
        {!!subtitle && <Text style={{ color: BRAND.sub, fontSize: 14, lineHeight: 20 }}>{subtitle}</Text>}
        <ProgressDots step={step} total={total} />
        <View style={{ gap: 16 }}>{children}</View>
      </ScrollView>
    </View>
  );
}
const ti = {
  backgroundColor: "#121212",
  color: BRAND.ink,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: BRAND.line,
  fontSize: 16,
} as const;

/** ========= Step 1: Promo (video + CTA to Commander's link) ========= */
function StepPromo({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  const videoRef = useRef<Video | null>(null);
  // Keep a cinematic loop; include CTA to your URL
  return (
    <ScreenShell
      title="AisleMarts"
      subtitle="Smarter. Faster. Everywhere. Experience Mood-to-Cart™ across luxury, trending and the best deals."
      step={0}
      total={6}
    >
      <View style={{ borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: BRAND.line, backgroundColor: "#111" }}>
        <Video
          ref={videoRef}
          source={{ uri: "https://cdn.coverr.co/videos/coverr-shopping-aisles-8515/1080p.mp4" }}
          style={{ width: "100%", height: 220 }}
          resizeMode="cover"
          isLooping
          shouldPlay
          isMuted
        />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <SecondaryButton label="Watch Promo" onPress={() => WebBrowser.openBrowserAsync(PROMO_URL)} />
        <SecondaryButton label="Sign In" onPress={onSignIn} />
        <PrimaryButton label="Sign Up" onPress={onSignUp} />
      </View>
      <Text style={{ color: "#7f7f7f", fontSize: 13 }}>By continuing you agree to our Terms & Privacy Policy.</Text>
    </ScreenShell>
  );
}

/** ========= Step 2: Auth (email + Apple + Google hooks) ========= */
function StepAuth({
  onNext, mode, setMode,
}: { onNext: (userId: string, token: string) => void; mode: "signin" | "signup"; setMode: (m: "signin" | "signup") => void }) {
  const [email, setEmail] = useState(""); const [pwd, setPwd] = useState("");
  const canProceed = email.includes("@") && pwd.length >= 6;

  const handleEmailAuth = async () => {
    try {
      const path = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const { user_id, token } = await api<{ user_id: string; token: string }>(path, {
        method: "POST",
        body: JSON.stringify({ email, password: pwd }),
      });
      onNext(user_id, token);
    } catch (e: any) {
      Alert.alert("Authentication failed", e.message?.toString() ?? "Please try again.");
    }
  };

  const handleGoogle = async () => {
    await WebBrowser.openBrowserAsync(`${API_BASE}/auth/google`); // optional web OAuth
  };
  const handleApple = async () => {
    if (Platform.OS !== "ios") return;
    try {
      await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // Exchange Apple token with backend here if needed
      onNext("apple-user", "apple-jwt");
    } catch {}
  };

  return (
    <ScreenShell
      title={mode === "signin" ? "Welcome back" : "Create your account"}
      subtitle="Use email or continue with Apple / Google."
      step={1}
      total={6}
    >
      <View style={{ gap: 10 }}>
        <TextInput placeholder="Email" placeholderTextColor="#777" style={ti} autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} value={email} />
        <TextInput placeholder={mode === "signin" ? "Password" : "Create a password (min 6)"} placeholderTextColor="#777" style={ti} secureTextEntry onChangeText={setPwd} value={pwd} />
        <PrimaryButton label={mode === "signin" ? "Sign In" : "Create Account"} onPress={handleEmailAuth} disabled={!canProceed} />
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {Platform.OS === "ios" && <View style={{ flex: 1 }}><SecondaryButton label="Continue with Apple" onPress={handleApple} /></View>}
        <View style={{ flex: 1 }}><SecondaryButton label="Continue with Google" onPress={handleGoogle} /></View>
      </View>

      <Pressable onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
        <Text style={{ color: BRAND.sub, textAlign: "center", marginTop: 6 }}>
          {mode === "signin" ? "New to AisleMarts? Create an account" : "Have an account? Sign in"}
        </Text>
      </Pressable>
    </ScreenShell>
  );
}

/** ========= Step 3: Permissions ========= */
function StepPermissions({ onNext }: { onNext: () => void }) {
  const [notif, setNotif] = useState(false); const [loc, setLoc] = useState(false);
  const [cam, setCam] = useState(false); const [media, setMedia] = useState(false);

  const ask = async (fn: () => Promise<any>, set: (b: boolean) => void) => {
    try { const { status } = await fn(); set(status === "granted"); } catch {}
  };

  return (
    <ScreenShell
      title="Enable your experience"
      subtitle="Turn on key permissions for the best Mood-to-Cart™ results. (Other devices can be linked later in Settings.)"
      step={2}
      total={6}
    >
      <PermRow label="Notifications" value={notif} onPress={() => ask(Notifications.requestPermissionsAsync, setNotif)} />
      <PermRow label="Location (Nearby & delivery)" value={loc} onPress={() => ask(Location.requestForegroundPermissionsAsync, setLoc)} />
      <PermRow label="Camera (visual search)" value={cam} onPress={() => ask(ImagePicker.requestCameraPermissionsAsync, setCam)} />
      <PermRow label="Media Library (share looks)" value={media} onPress={() => ask(ImagePicker.requestMediaLibraryPermissionsAsync, setMedia)} />
      <PrimaryButton label="Continue" onPress={onNext} />
      <Text style={{ color: "#7f7f7f", fontSize: 12 }}>You can adjust permissions anytime in Settings.</Text>
    </ScreenShell>
  );
}
function PermRow({ label, value, onPress }: { label: string; value: boolean; onPress: () => void }) {
  return (
    <View style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: BRAND.line, backgroundColor: BRAND.card, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Text style={{ color: BRAND.ink, fontSize: 16 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ color: value ? "#7fff7f" : BRAND.sub, fontSize: 12 }}>{value ? "Enabled" : "Off"}</Text>
        <SecondaryButton label="Allow" onPress={onPress} />
      </View>
    </View>
  );
}

/** ========= Step 4: AI Welcome ========= */
function StepAIWelcome({ onNext }: { onNext: () => void }) {
  const subtitle = "Say 'I feel luxurious today' and we'll curate a cart in seconds. Ask in English, Turkish, Arabic, French, or Swahili.";
  
  return (
    <ScreenShell
      title="Meet Aisle — your AI"
      subtitle={subtitle}
      step={3}
      total={6}
    >
      <View style={{ padding: 16, borderRadius: 20, borderWidth: 1, borderColor: BRAND.line, backgroundColor: BRAND.card, gap: 12 }}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1400&auto=format&fit=crop" }}
          style={{ width: "100%", height: 140, borderRadius: 14 }}
        />
        <Text style={{ color: BRAND.sub, fontSize: 14, lineHeight: 20 }}>
          Aisle understands mood, context, and style. Your session memory stays private and improves recommendations across devices.
        </Text>
      </View>
      <PrimaryButton label="Continue" onPress={onNext} />
    </ScreenShell>
  );
}

/** ========= Step 5: Preferences ========= */
function StepPreferences({ onNext, onBack }: { onNext: (p: { styles: string[]; budget: string; language: string }) => void; onBack: () => void; }) {
  const [styles, setStyles] = useState<string[]>([]);
  const [budget, setBudget] = useState("$$");
  const [language, setLanguage] = useState("en");
  const toggleStyle = (s: string) => setStyles((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const canContinue = styles.length > 0;

  return (
    <ScreenShell title="Your preferences" subtitle="Tell Aisle what to prioritize. You can change this anytime." step={4} total={6}>
      <PillGrid label="Style focus" options={["Luxury", "Minimal", "Streetwear", "Classic", "Tech", "Home"]} values={styles} onToggle={toggleStyle} />
      <Segment label="Budget" options={["$", "$$", "$$$"]} value={budget} onChange={setBudget} />
      <Segment label="Language" options={["en", "tr", "ar", "fr", "sw"]} value={language} onChange={setLanguage} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <SecondaryButton label="Back" onPress={onBack} />
        <PrimaryButton label="Continue" onPress={() => onNext({ styles, budget, language })} disabled={!canContinue} />
      </View>
    </ScreenShell>
  );
}
function PillGrid({ label, options, values, onToggle }: { label: string; options: string[]; values: string[]; onToggle: (v: string) => void; }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: BRAND.ink, fontSize: 16, fontWeight: "700" }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {options.map((o) => {
          const selected = values.includes(o);
          return (
            <Pressable
              key={o}
              onPress={() => onToggle(o)}
              style={{
                paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1,
                borderColor: selected ? BRAND.gold : BRAND.line, backgroundColor: selected ? BRAND.focus : "#111",
              }}
            >
              <Text style={{ color: selected ? BRAND.gold : BRAND.ink }}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
function Segment({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void; }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: BRAND.ink, fontSize: 16, fontWeight: "700" }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {options.map((o) => {
          const selected = value === o;
          return (
            <Pressable
              key={o}
              onPress={() => onChange(o)}
              style={{
                paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1,
                borderColor: selected ? BRAND.gold : BRAND.line, backgroundColor: selected ? BRAND.focus : "#111",
              }}
            >
              <Text style={{ color: selected ? BRAND.gold : BRAND.ink }}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** ========= Step 6: Packages ========= */
function StepPackages({ onNext, onBack }: { onNext: (pkg: string) => void; onBack: () => void; }) {
  const [selected, setSelected] = useState<string>("Starter");
  const tiers = useMemo(() => [
    { name: "Starter", price: "$0",   perks: ["AI chat", "Collections", "Standard delivery"] },
    { name: "Plus",    price: "$9/mo", perks: ["Mood-to-Cart™", "Voice shopping", "Priority support"] },
    { name: "Elite",   price: "$29/mo", perks: ["Personal AI stylist", "Same-day delivery*", "Early access drops"] },
  ], []);

  return (
    <ScreenShell title="Choose your package" subtitle="Upgrade anytime. Elite includes premium courier partners in select regions." step={5} total={6}>
      <View style={{ gap: 12 }}>
        {tiers.map((t) => {
          const isSel = selected === t.name;
          return (
            <Pressable
              key={t.name}
              onPress={() => setSelected(t.name)}
              style={{
                padding: 16, borderRadius: 16, borderWidth: 1,
                borderColor: isSel ? BRAND.gold : BRAND.line, backgroundColor: BRAND.card, gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: BRAND.ink, fontSize: 18, fontWeight: "800" }}>{t.name}</Text>
                <Text style={{ color: BRAND.gold, fontSize: 16, fontWeight: "700" }}>{t.price}</Text>
              </View>
              <View style={{ gap: 6 }}>
                {t.perks.map((p) => (
                  <Text key={p} style={{ color: BRAND.sub, fontSize: 13 }}>• {p}</Text>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <SecondaryButton label="Back" onPress={onBack} />
        <PrimaryButton label="Continue" onPress={() => onNext(selected)} />
      </View>
    </ScreenShell>
  );
}

/** ========= Step 7: Summary → Main App ========= */
function StepComplete({
  onEnterApp, summary, token,
}: { onEnterApp: () => void; summary: { userId: string; language: string; styles: string[]; budget: string; pkg: string; }; token: string; }) {
  const save = async () => {
    try {
      await api(`/api/users/${summary.userId}/preferences`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          language: summary.language,
          styles: summary.styles,
          budget: summary.budget,
          package: summary.pkg,
          onboarded: true,
        }),
      });
      onEnterApp();
    } catch (e: any) {
      Alert.alert("Couldn't save preferences", e.message?.toString() ?? "Please try again.");
    }
  };

  return (
    <ScreenShell title="You're set — welcome to AisleMarts" subtitle="Your preferences are saved. Let's shop by mood, voice, and style." step={6} total={6}>
      <View style={{ padding: 16, borderRadius: 16, borderWidth: 1, borderColor: BRAND.line, backgroundColor: BRAND.card, gap: 8 }}>
        <Row label="Account" value={summary.userId} />
        <Row label="Language" value={summary.language.toUpperCase()} />
        <Row label="Styles" value={summary.styles.join(", ")} />
        <Row label="Budget" value={summary.budget} />
        <Row label="Package" value={summary.pkg} />
      </View>
      <PrimaryButton label="Enter AisleMarts" onPress={save} />
      <Text style={{ color: "#777", fontSize: 12 }}>Tip: tap the mic and say 'I feel luxurious today'.</Text>
    </ScreenShell>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: BRAND.sub }}>{label}</Text>
      <Text style={{ color: BRAND.ink, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

/** ========= Root Wizard ========= */
export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [userId, setUserId] = useState<string>(""); const [token, setToken] = useState<string>("");
  const [prefs, setPrefs] = useState<{ styles: string[]; budget: string; language: string } | null>(null);
  const [pkg, setPkg] = useState<string>("Starter");

  const enterApp = async () => {
    try {
      // Save onboarding completion flag
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      console.log('✅ Onboarding completed, navigating to main app');
      router.replace("/"); // main app route
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      router.replace("/"); // proceed anyway
    }
  };

  if (step === 0) return <StepPromo onSignIn={() => { setAuthMode("signin"); setStep(1); }} onSignUp={() => { setAuthMode("signup"); setStep(1); }} />;
  if (step === 1) return <StepAuth onNext={(uid, t) => { setUserId(uid); setToken(t); setStep(2); }} mode={authMode} setMode={setAuthMode} />;
  if (step === 2) return <StepPermissions onNext={() => setStep(3)} />;
  if (step === 3) return <StepAIWelcome onNext={() => setStep(4)} />;
  if (step === 4) return <StepPreferences onBack={() => setStep(3)} onNext={(p) => { setPrefs(p); setStep(5); }} />;
  if (step === 5) return <StepPackages onBack={() => setStep(4)} onNext={(sel) => { setPkg(sel); setStep(6); }} />;
  return (
    <StepComplete
      onEnterApp={enterApp}
      token={token}
      summary={{
        userId,
        language: prefs?.language || "en",
        styles: prefs?.styles || [],
        budget: prefs?.budget || "$$",
        pkg,
      }}
    />
  );
}
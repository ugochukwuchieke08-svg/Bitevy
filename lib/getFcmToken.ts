export function getFcmToken(): string | null {
  if (typeof window === "undefined") return null;

  // @ts-ignore
  console.log("window.JSBridge =", window.JSBridge);

  // @ts-ignore
  console.log("window.JSBridge?.getFcmToken =", window.JSBridge?.getFcmToken);

  try {
    // @ts-ignore
    if (window.JSBridge?.getFcmToken) {
      // @ts-ignore
      const token = window.JSBridge.getFcmToken();
      console.log("Token from Android:", token);
      return token;
    }
  } catch (e) {
    console.error("Failed to get FCM token:", e);
  }


  
  return null;
}


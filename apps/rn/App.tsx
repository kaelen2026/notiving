import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { bridge } from "./src/lib/bridge";

function App(): React.JSX.Element {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    bridge.getToken().then(setToken);
    bridge.ready();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>notiving</Text>
      <Text style={styles.subtitle}>RN Runtime</Text>
      <Text style={styles.info}>
        Token: {token ? `${token.slice(0, 20)}...` : "null"}
      </Text>
      <View style={styles.buttons}>
        <Button title="Go to Home" onPress={() => bridge.navigate("/")} />
        <Button
          title="Go to Explore"
          onPress={() => bridge.navigate("/explore")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  info: {
    fontSize: 14,
    color: "#999",
    fontFamily: "monospace",
  },
  buttons: {
    marginTop: 16,
    gap: 8,
  },
});

export default App;

import HomeScreen from "@/src/screens/Homescreen";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

export default function Home() {
  const router = useRouter();

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20, // ให้เว้นระหว่างการ์ด
  },
  image: {
    width: "100%",
    height: 200,
  },
  textContainer: {
    padding: 12,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  artist: {
    fontSize: 16,
    color: "#b3b3b3",
  },
});

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import ToDoApp from "./ToDoApp";

const { width } = Dimensions.get('window'); //ekran boyutunu al

export default function Index() {
  const router = useRouter();
  const [showTodo, setShowTodo] = useState(false); //showTodo true ise ToDoApp'i göster

  if (showTodo) {
    return <ToDoApp onBack={() => setShowTodo(false)} />;
  }

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📝</Text>
        </View>
        <Text style={styles.title}>ToDo Uygulamasına{'\n'}Hoş Geldiniz!</Text>
        <Text style={styles.subtitle}>Görevlerinizi kolayca yönetin ve{'\n'}organize edin</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowTodo(true)}
        >
          <LinearGradient
            colors={['#ff9a9e', '#fad0c4']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Başla</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: '#ffffff',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 26,
  },
  button: {
    width: width * 0.7,
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
});

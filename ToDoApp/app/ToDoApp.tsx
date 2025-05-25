import React, { useEffect, useState } from "react";
import {FlatList, Text, TextInput, View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Dimensions, Animated, Image,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
type ToDoType = {
  id: number;
  title: string;
  isDone: boolean;
};

export default function ToDoApp({ onBack }: { onBack: () => void }) { //geri dönme fonksiyonu
  
  const [todos, setTodos] = useState<ToDoType[]>([]);
  const [todoText, setTodoText] = useState<string>("");//yeni görev
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [oldTodos, setOldTodos] = useState<ToDoType[]>([]);//eski görevler
  const [fadeAnim] = useState(new Animated.Value(0));
  const [editingTodo, setEditingTodo] = useState<ToDoType | null>(null);

  useEffect(() => { //uygulama başlangıcındaki animasyon
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const getTodos = async () => {
      try {
        const todos = await AsyncStorage.getItem("my-todo");
        if (todos !== null) {
          const parsed = JSON.parse(todos);
          setTodos(parsed);
          setOldTodos(parsed);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTodos();
  }, []);

  const editTodo = (id: number) => { 
    const todoToEdit = todos.find(todo => todo.id === id);
    if (todoToEdit) {
      setEditingTodo(todoToEdit);
      setTodoText(todoToEdit.title);
    }
  };

  const saveEdit = async () => {
    if (!editingTodo || todoText.trim() === "") return;
    
    try {
      const updatedTodos = todos.map(todo =>
        todo.id === editingTodo.id ? { ...todo, title: todoText.trim() } : todo
      ); //  todo.id === editingTodo.id eşleşirse öğeyi günceller.
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      setTodoText("");
      setEditingTodo(null);
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setTodoText("");
    Keyboard.dismiss();
  };

  const addTodo = async () => {
    if (todoText.trim() === "") return;
    
    if (editingTodo) {
      await saveEdit();//düzenleme varsa kaydet
      return;
    }

    try {
      const newTodo = {
        id: Date.now(),
        title: todoText.trim(),
        isDone: false,
      };
      const updatedTodos = [newTodo, ...todos];
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
      setTodoText("");
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const newTodos = todos.filter((todo) => todo.id !== id);
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
      setTodos(newTodos);
      setOldTodos(newTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDone = async (id: number) => { // görev tamamlandı mı kontrolü
    try {
      const newTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      );
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
      setTodos(newTodos);
      setOldTodos(newTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const onSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setTodos(oldTodos);
    } else {
      const filteredTodos = oldTodos.filter((todo) =>
        todo.title.toLowerCase().includes(query.toLowerCase())
      );
      setTodos(filteredTodos);
    }
  };

  return (
    <LinearGradient
      colors={['#2C3E50', '#3498DB']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onBack} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={require("./images/images.jpeg")}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <BlurView intensity={20} style={styles.searchBar}>
          <Ionicons name="search" size={24} color="#fff" />
          <TextInput
            placeholder="Görev ara..."
            value={searchQuery}
            onChangeText={onSearch}
            style={styles.searchInput}
            clearButtonMode="always"
            placeholderTextColor="rgba(255,255,255,0.7)"
          />
        </BlurView>

        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={[...todos].reverse()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ToDoItem
                todo={item}
                deleteTodo={deleteTodo}
                handleDone={handleDone}
                editTodo={editTodo}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.footer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={10}
        >
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={editingTodo ? "Görevi düzenle..." : "Yeni görev ekle..."}
              value={todoText}
              onChangeText={setTodoText}
              style={styles.newTodoInput}
              autoCorrect={false}
              placeholderTextColor="rgba(255,255,255,0.7)"
              onSubmitEditing={addTodo}
              returnKeyType="done"
            />
            {editingTodo && (
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={cancelEdit}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={addTodo}
            >
              <LinearGradient
                colors={editingTodo ? ['#27AE60', '#2ECC71'] : ['#E74C3C', '#C0392B']}
                style={styles.addButtonGradient}
              >
                <Ionicons 
                  name={editingTodo ? "checkmark" : "add"} 
                  size={34} 
                  color="#fff" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const ToDoItem = ({
  todo,
  deleteTodo,
  handleDone,
  editTodo,
}: {
  todo: ToDoType;
  deleteTodo: (id: number) => void;
  handleDone: (id: number) => void;
  editTodo: (id: number) => void;
}) => (
  <View style={styles.todoContainer}>
    <View style={styles.todoInfoContainer}>
      <Checkbox
        value={todo.isDone}
        onValueChange={() => handleDone(todo.id)}
        color={todo.isDone ? "#E74C3C" : undefined}
        style={styles.checkbox}
      />
      <Text
        style={[
          styles.todoText,
          todo.isDone && styles.todoTextDone,
        ]}
      >
        {todo.title}
      </Text>
    </View>
    <View style={styles.todoActions}>
      <TouchableOpacity 
        onPress={() => editTodo(todo.id)}
        style={styles.editButton}
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => deleteTodo(todo.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButton: {
    padding: 5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 8,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  todoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  todoInfoContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
  todoText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  todoTextDone: {
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.5)",
  },
  todoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  cancelButton: {
    padding: 5,
    marginRight: 5,
  },
  footer: {
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    overflow: 'hidden',
    padding: 5,
  },
  newTodoInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#fff",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginLeft: 10,
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

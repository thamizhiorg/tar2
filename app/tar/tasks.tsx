import { StyleSheet, Text, View, FlatList } from "react-native";

const sampleTasks = [
  { id: '1', title: 'Complete project proposal', status: 'pending' },
  { id: '2', title: 'Review documentation', status: 'completed' },
  { id: '3', title: 'Team meeting at 2 PM', status: 'pending' },
  { id: '4', title: 'Update weekly report', status: 'pending' },
];

export default function TasksScreen() {
  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskText}>{item.title}</Text>
      <View style={styles.divider} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sampleTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  list: {
    flex: 1,
    marginTop: 16,
  },
  taskItem: {
    paddingVertical: 16,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 16,
  },
});

import { StyleSheet, Text, View, FlatList } from "react-native";
import GlobalStyles, { Layout, Typography, Colors } from "../../styles/globalStyles";

const sampleTasks = [
  { id: '1', title: 'Complete project proposal', status: 'pending' },
  { id: '2', title: 'Review documentation', status: 'completed' },
  { id: '3', title: 'Team meeting at 2 PM', status: 'pending' },
  { id: '4', title: 'Update weekly report', status: 'pending' },
];

export default function TasksScreen() {
  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={Typography.body}>{item.title}</Text>
      <View style={styles.divider} />
    </View>
  );

  return (
    <View style={Layout.container}>
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

// Component-specific styles that use global colors
const styles = StyleSheet.create({
  list: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  taskItem: {
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.lightest,
    marginTop: 16,
  },
});

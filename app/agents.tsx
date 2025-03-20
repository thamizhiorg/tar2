import { Text, View, StyleSheet, FlatList, Pressable } from "react-native";

export default function Index() {
  const menuItems = [
    { id: '1', icon: '🌌', title: 'Space' },
    { id: '2', icon: '🎈', title: 'Sales' },
    { id: '3', icon: '📦', title: 'Products' },
    { id: '4', icon: '🗃️', title: 'Inventory' },
    { id: '5', icon: '🥁', title: 'Posts' },
    { id: '6', icon: '🔗', title: 'Pages' },
    { id: '7', icon: '〰️', title: 'Path' },
    { id: '8', icon: '🎯', title: 'Analytics' },
    { id: '9', icon: '🎮', title: 'Settings' },
    { id: '10', icon: '🕹️', title: 'AI agent' },
  ];

  const renderMenuItem = ({ item, index }) => (
    <Pressable 
      style={styles.menuItem}
      onPress={() => console.log(`${item.title} selected`)}
    >
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.menuText}>{item.title}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agents</Text>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 24,
    color: '#333',
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContainer: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  icon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },
});

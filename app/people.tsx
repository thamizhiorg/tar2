import { StyleSheet, Text, View, FlatList, Image } from "react-native";

const samplePeople = [
  { id: '1', name: 'Sarah Connor', image: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'John Smith', image: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Emma Watson', image: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Michael Brown', image: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', name: 'Lisa Anderson', image: 'https://i.pravatar.cc/150?img=5' },
];

export default function PeopleScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );

  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={samplePeople}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 16,
  },
  name: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});

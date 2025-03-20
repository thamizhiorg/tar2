import { StyleSheet, Text, View, FlatList, Image } from "react-native";

const samplePeople = [
  { id: '1', name: 'Hallie Alvarado', location: 'from Home', image: 'https://randomuser.me/api/portraits/women/32.jpg' },
  { id: '2', name: 'Jackson Houston', location: 'from Work', image: 'https://randomuser.me/api/portraits/men/44.jpg' },
  { id: '3', name: 'Lina Bradley', location: 'from University', image: 'https://randomuser.me/api/portraits/women/28.jpg' },
  { id: '4', name: 'Katie White', location: 'from Home', image: 'https://randomuser.me/api/portraits/women/17.jpg' },
  { id: '5', name: 'Mae Walsh', location: 'from Work', image: 'https://randomuser.me/api/portraits/women/56.jpg' },
  { id: '6', name: 'Adeline McGuire', location: 'from University', image: 'https://randomuser.me/api/portraits/women/63.jpg' },
];

export default function PeopleScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.name}>{item.name}</Text>
      </View>
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
    paddingHorizontal: 0,
    paddingTop: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 16,
  },
  location: {
    fontSize: 14,
    color: '#888',
  },
  name: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  separator: {
    height: 2,
  },
});

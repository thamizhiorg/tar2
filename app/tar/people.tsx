import { StyleSheet, Text, View, FlatList, Image } from "react-native";
import GlobalStyles, { Layout, Typography, Colors, Cards } from "../../styles/globalStyles";

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
        <Text style={Typography.small}>{item.location}</Text>
        <Text style={Typography.body}>{item.name}</Text>
      </View>
    </View>
  );

  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <View style={Layout.container}>
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

// Using a mixed approach with global color references and component-specific styles
const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 16,
  },
  separator: {
    height: 2,
  },
});

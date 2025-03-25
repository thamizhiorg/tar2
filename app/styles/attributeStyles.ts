import { StyleSheet } from 'react-native';

const attributeStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addButton: {
    padding: 8,
    marginRight: -8,
  },
  
  // Search styles
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#1A1A1A',
  },
  
  // List styles
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    flexGrow: 1,
  },
  
  // Item styles
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  
  // Action button styles
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  
  // Status styles
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Changed to bottom sheet style
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 32, // Extra padding for bottom
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Unit styles
  unitItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitAbbreviation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  unitInfo: {
    marginBottom: 12,
  },
  baseUnitTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EA',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  baseUnitText: {
    fontSize: 12,
    color: '#34A853',
    fontWeight: '500',
  },
  conversionText: {
    fontSize: 14,
    color: '#666',
  },
  unitFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  // Tax styles
  taxItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  taxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taxRegion: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  taxValue: {
    fontSize: 15,
    color: '#FF6B6B',
    marginTop: 4,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },

  // Option styles
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  valueChip: {
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  valueText: {
    fontSize: 14,
    color: '#4285F4',
  },
  optionType: {
    fontSize: 13,
    color: '#777',
    textTransform: 'capitalize',
  },

  // Modifier styles
  modifierItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  modifierItems: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modifierItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  moreItems: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  selectionRule: {
    backgroundColor: '#FFF4F4',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectionRuleText: {
    fontSize: 12,
    color: '#EA4335',
  },
  itemCount: {
    fontSize: 13,
    color: '#777',
  },

  // Category styles
  categoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  categoryMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },

  // Collection styles
  collectionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  collectionHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  collectionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  collectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },

  // Theme color variants
  themeColorUnit: { backgroundColor: '#34A853' },
  themeColorTax: { backgroundColor: '#46BDC6' },
  themeColorOption: { backgroundColor: '#4285F4' },
  themeColorModifier: { backgroundColor: '#EA4335' },
  themeColorCategory: { backgroundColor: '#FBBC05' },
  themeColorCollection: { backgroundColor: '#8F57EB' },
});

export default attributeStyles;
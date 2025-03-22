import { StyleSheet, Dimensions } from 'react-native';

// Get screen dimensions for responsive styling
const { width, height } = Dimensions.get('window');

// Theme colors - centralized color definitions
export const Colors = {
  primary: '#007AFF',
  secondary: '#4a86e8',
  background: '#ffffff',
  surface: '#f5f5f5',
  error: '#ff3b30',
  success: '#28a745',
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#888888',
    light: '#999999',
  },
  border: {
    light: '#e0e0e0',
    lighter: '#eeeeee',
    lightest: '#f0f0f0',
  }
};

// Typography scale - consistent text styles
export const Typography = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  caption: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  small: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  tiny: {
    fontSize: 10,
    color: Colors.text.light,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  productVendor: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  noItemsText: {
    fontStyle: 'italic',
    color: Colors.text.light,
    textAlign: 'center',
    padding: 8,
  },
  placeholderText: {
    marginTop: 10,
    color: Colors.text.tertiary,
  },
});

// Layout styles - common layout patterns
export const Layout = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  padding: {
    padding: 16,
  },
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  paddingVertical: {
    paddingVertical: 16,
  },
  margin: {
    margin: 16,
  },
  marginHorizontal: {
    marginHorizontal: 16,
  },
  marginVertical: {
    marginVertical: 16,
  },
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  expandedContent: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  tabContent: {
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
});

// Form elements - inputs, buttons, etc.
export const Forms = StyleSheet.create({
  input: {
    flex: 1,
    padding: 14,
    backgroundColor: Colors.background,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  smallInput: {
    flex: 0.48,
    marginRight: 0,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
  },
  createButton: {
    padding: 14,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.border.light,
  },
  inventoryButton: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.background,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  deleteButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  inventoryButtonLarge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  headerButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
});

// Card and list item styles
export const Cards = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.lightest,
    backgroundColor: Colors.background,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productListItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.lighter,
    minHeight: 60,
  },
  inventoryListItem: {
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
    backgroundColor: Colors.surface,
    borderRadius: 4,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.lightest,
  },
  selectedInventoryItem: {
    backgroundColor: '#f0f8ff',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inventoryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  inventoryPreviewText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  linkedInventoryList: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  linkedInventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  inventoryItemDetails: {
    flex: 1,
  },
  inventoryItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  inventoryItemSku: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  inventoryItemQty: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  linkedInventoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  linkedInventorySku: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  unlinkButton: {
    padding: 8,
  },
  noInventoryPlaceholder: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 16,
  },
});

// Components like modals, headers, footers
export const Components = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background,
  },
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
    elevation: 0,
    shadowOpacity: 0,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background,
  },
  editModalProductTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'left',
    marginLeft: 8,
  },
  editModalContentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  tabsContainerWrapper: {
    paddingVertical: 0,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border.light,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  squareTab: {
    width: 58.5,
    height: 50,
    backgroundColor: Colors.background,
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSquareTab: {
    backgroundColor: '#e6f0ff',
  },
  tabLetter: {
    fontSize: 24,
    fontWeight: '500',
    color: '#000',
  },
  activeTabLetter: {
    color: Colors.secondary,
  },
  editModalPrimary: {
    flex: 1,
    borderBottomWidth: 0,
  },
  editModalSecondary: {
    flex: 1,
    padding: 16,
  },
  editModalScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  form: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    padding: 16,
  },
  mediaRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  mediaThumbnailContainer: {
    width: 60,
    marginRight: 12,
  },
  mediaThumbnail: {
    width: 50,
    height: 50,
    backgroundColor: '#e6f0ff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  emptyMediaThumbnail: {
    width: 50,
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  mediaInputContainer: {
    flex: 1,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  mediaInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
});

// Export combined styles for quick access
const GlobalStyles = {
  Colors,
  Typography,
  Layout,
  Forms,
  Cards,
  Components,
};

export default GlobalStyles;
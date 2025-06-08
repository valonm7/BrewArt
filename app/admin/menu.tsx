import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { Alert, FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';


import { ThemedText } from '@/components/ThemedText';
import { createMenuItem, deleteMenuItem, getAllMenuItems, updateMenuItem } from '@/services/menuService';
import { useEffect, useState } from 'react';

// Types for menu items
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export default function AdminMenuScreen() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for adding new items
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'coffee',
    available: true
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Categories for the menu
  const categories = [
    { id: 'coffee', name: 'Coffee' },
    { id: 'tea', name: 'Tea' },
    { id: 'pastry', name: 'Pastries' },
    { id: 'sandwich', name: 'Sandwiches' },
    { id: 'dessert', name: 'Desserts' }
  ];
  
  // Filter state
  const [activeCategory, setActiveCategory] = useState('all');
  
  useEffect(() => {
    loadMenuItems();
  }, []);
  
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const result = await getAllMenuItems();
      
      if (result.success) {
        setMenuItems(result.menuItems);
      } else {
        setError('Failed to load menu items');
      }
    } catch (err) {
      setError('Error loading menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      
      const itemData = {
        ...newItem,
        price: Number(newItem.price),
        image: selectedImage || undefined
      };
      
      let result;
      
      if (editingItem) {
        // Update existing item
        result = await updateMenuItem(editingItem.id, itemData);
      } else {
        // Create new item
        result = await createMenuItem(itemData);
      }
      
      if (result.success) {
        // Reset form
        setNewItem({
          name: '',
          description: '',
          price: 0,
          category: 'coffee',
          available: true
        });
        setSelectedImage(null);
        setIsAddingItem(false);
        setEditingItem(null);
        
        // Reload menu items
        await loadMenuItems();
        
        Alert.alert(
          'Success', 
          editingItem ? 'Menu item updated successfully' : 'Menu item added successfully'
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to save menu item');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred while saving the menu item');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available
    });
    setSelectedImage(item.image || null);
    setIsAddingItem(true);
  };
  
  const handleDeleteItem = async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await deleteMenuItem(itemId);
              
              if (result.success) {
                await loadMenuItems();
                Alert.alert('Success', 'Menu item deleted successfully');
              } else {
                Alert.alert('Error', result.message || 'Failed to delete menu item');
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'An error occurred while deleting the menu item');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };
  
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);
  
  const renderAddItemForm = () => (
    <View style={styles.formContainer}>
      <ThemedText style={styles.formTitle}>
        {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
      </ThemedText>
      
      <View style={styles.imagePickerContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#B5A99A" />
          </View>
        )}
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <ThemedText style={styles.imagePickerButtonText}>
            {selectedImage ? 'Change Image' : 'Select Image'}
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Name*</ThemedText>
        <TextInput
          style={styles.input}
          value={newItem.name}
          onChangeText={(text) => setNewItem({ ...newItem, name: text })}
          placeholder="Item name"
          placeholderTextColor="#B5A99A"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Description*</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={newItem.description}
          onChangeText={(text) => setNewItem({ ...newItem, description: text })}
          placeholder="Item description"
          placeholderTextColor="#B5A99A"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Price*</ThemedText>
        <TextInput
          style={styles.input}
          value={String(newItem.price || '')}
          onChangeText={(text) => setNewItem({ ...newItem, price: parseFloat(text) || 0 })}
          placeholder="0.00"
          placeholderTextColor="#B5A99A"
          keyboardType="decimal-pad"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Category</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                newItem.category === category.id && styles.selectedCategory
              ]}
              onPress={() => setNewItem({ ...newItem, category: category.id })}
            >
              <ThemedText style={[
                styles.categoryText,
                newItem.category === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.availabilityContainer}>
        <ThemedText style={styles.label}>Available</ThemedText>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setNewItem({ ...newItem, available: !newItem.available })}
        >
          <View style={[
            styles.toggleTrack,
            newItem.available && styles.toggleTrackActive
          ]}>
            <View style={[
              styles.toggleThumb,
              newItem.available && styles.toggleThumbActive
            ]} />
          </View>
          <ThemedText style={styles.toggleText}>
            {newItem.available ? 'Yes' : 'No'}
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={() => {
            setIsAddingItem(false);
            setEditingItem(null);
            setNewItem({
              name: '',
              description: '',
              price: 0,
              category: 'coffee',
              available: true
            });
            setSelectedImage(null);
          }}
        >
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleAddItem}
        >
          <ThemedText style={styles.saveButtonText}>
            {editingItem ? 'Update Item' : 'Add Item'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      ) : (
        <View style={styles.menuItemImagePlaceholder}>
          <Ionicons name="cafe-outline" size={24} color="#8E6E53" />
        </View>
      )}
      
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <ThemedText style={styles.menuItemName}>{item.name}</ThemedText>
          <ThemedText style={styles.menuItemPrice}>${item.price.toFixed(2)}</ThemedText>
        </View>
        
        <ThemedText style={styles.menuItemDescription}>{item.description}</ThemedText>
        
        <View style={styles.menuItemFooter}>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryBadgeText}>
              {categories.find(c => c.id === item.category)?.name || item.category}
            </ThemedText>
          </View>
          
          {!item.available && (
            <View style={styles.unavailableBadge}>
              <ThemedText style={styles.unavailableBadgeText}>
                Unavailable
              </ThemedText>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.menuItemActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditItem(item)}
        >
          <Ionicons name="create-outline" size={22} color="#8E6E53" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Menu Management',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#8E6E53" />
            </TouchableOpacity>
          ),
        }}
      />
      
      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
      >
        <TouchableOpacity
          style={[
            styles.filterOption,
            activeCategory === 'all' && styles.activeFilter
          ]}
          onPress={() => setActiveCategory('all')}
        >
          <ThemedText style={[
            styles.filterText,
            activeCategory === 'all' && styles.activeFilterText
          ]}>
            All
          </ThemedText>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterOption,
              activeCategory === category.id && styles.activeFilter
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <ThemedText style={[
              styles.filterText,
              activeCategory === category.id && styles.activeFilterText
            ]}>
              {category.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Add Item Form */}
      {isAddingItem && renderAddItemForm()}
      
      {/* Menu List */}
      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.menuList}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>
            {loading ? 'Loading menu items...' : 'No menu items found'}
          </ThemedText>
        }
      />
      
      {/* Add Button */}
      {!isAddingItem && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingItem(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  categoryFilter: {
    padding: 15,
    backgroundColor: '#F4EDE4',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  activeFilter: {
    backgroundColor: '#8E6E53',
  },
  filterText: {
    color: '#8E6E53',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  menuList: {
    padding: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E6E53',
    marginTop: 40,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  menuItemImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F4EDE4',
    borderRadius: 8,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    flex: 1,
    marginRight: 10,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E6E53',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6D5D4A',
    marginBottom: 8,
  },
  menuItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#F4EDE4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#8E6E53',
  },
  unavailableBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableBadgeText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  menuItemActions: {
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8E6E53',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 15,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    backgroundColor: '#F4EDE4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
  },
  imagePickerButtonText: {
    color: '#8E6E53',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F6F2',
    borderWidth: 1,
    borderColor: '#E6D9CC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#3C2A15',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F4EDE4',
  },
  selectedCategory: {
    backgroundColor: '#8E6E53',
  },
  categoryText: {
    color: '#8E6E53',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6D9CC',
    justifyContent: 'center',
    padding: 3,
  },
  toggleTrackActive: {
    backgroundColor: '#8E6E53',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  toggleText: {
    marginLeft: 10,
    color: '#3C2A15',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F4EDE4',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#8E6E53',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8E6E53',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 
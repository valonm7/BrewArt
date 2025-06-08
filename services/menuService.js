import { apiRequest } from './api';

// Get all menu items
export const getAllMenuItems = async (category = null) => {
  try {
    // Add category as a query parameter if provided
    const endpoint = category ? `/menu?category=${encodeURIComponent(category)}` : '/menu';
    const response = await apiRequest(endpoint, 'GET');
    return { success: true, menuItems: response };
  } catch (error) {
    console.error('Error fetching menu items:', error.message);
    return { success: false, message: error.message };
  }
};

// Get a single menu item by ID
export const getMenuItemById = async (id) => {
  try {
    const response = await apiRequest(`/menu/${id}`, 'GET');
    return { success: true, menuItem: response };
  } catch (error) {
    console.error('Error fetching menu item:', error.message);
    return { success: false, message: error.message };
  }
};

// Get all menu categories
export const getMenuCategories = async () => {
  try {
    const response = await apiRequest('/menu/categories', 'GET');
    return { success: true, categories: response };
  } catch (error) {
    console.error('Error fetching menu categories:', error.message);
    return { success: false, message: error.message };
  }
};

// Admin: Create a new menu item
export const createMenuItem = async (menuItemData) => {
  try {
    const response = await apiRequest('/menu', 'POST', menuItemData, true);
    return { success: true, menuItem: response };
  } catch (error) {
    console.error('Error creating menu item:', error.message);
    return { success: false, message: error.message };
  }
};

// Admin: Update a menu item
export const updateMenuItem = async (id, menuItemData) => {
  try {
    const response = await apiRequest(`/menu/${id}`, 'PUT', menuItemData, true);
    return { success: true, menuItem: response };
  } catch (error) {
    console.error('Error updating menu item:', error.message);
    return { success: false, message: error.message };
  }
};

// Admin: Delete a menu item
export const deleteMenuItem = async (id) => {
  try {
    const response = await apiRequest(`/menu/${id}`, 'DELETE', null, true);
    return { success: true, message: response.message };
  } catch (error) {
    console.error('Error deleting menu item:', error.message);
    return { success: false, message: error.message };
  }
}; 
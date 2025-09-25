import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './PPEManagement.css';
import * as ppeService from '../../../services/ppeService';
import CategoryEditModal from './CategoryEditModal';
import CategoryDetailModal from './CategoryDetailModal';
import ImportCategoriesModal from './ImportCategoriesModal';
import ImportItemsModal from './ImportItemsModal';
import type { 
  PPECategory, 
  PPEItem, 
  PPEIssuance,
  CreateIssuanceData,
  UpdateItemQuantityData
} from '../../../services/ppeService';
import type { RootState } from '../../../store';

const PPEManagement: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState<string | null>(null);
  
  // Modal states
  const [selectedCategory, setSelectedCategory] = useState<PPECategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<PPEItem | null>(null);
  const [showCategoryDetailModal, setShowCategoryDetailModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [showItemEditModal, setShowItemEditModal] = useState(false);
  const [showViewPPEModal, setShowViewPPEModal] = useState(false);
  const [showImportCategoriesModal, setShowImportCategoriesModal] = useState(false);
  const [showImportItemsModal, setShowImportItemsModal] = useState(false);
  
  // State for data
  const [ppeCategories, setPpeCategories] = useState<PPECategory[]>([]);
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]);
  
  // PPE Assignment states
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPPE, setUserPPE] = useState<PPEIssuance[]>([]);
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [forceModalRefresh, setForceModalRefresh] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState({
    categories: false,
    items: false,
    issuances: false,
    assignment: false,
    users: false
  });
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    updateQuantity: {
      quantity_available: 0,
      quantity_allocated: 0
    } as UpdateItemQuantityData,
    issuePPE: {} as CreateIssuanceData,
    addCategory: {
      category_name: '',
      description: '',
      lifespan_months: 0
    },
    addItem: {
      category_id: '',
      item_code: '',
      item_name: '',
      brand: '',
      model: '',
      reorder_level: 10,
      quantity_available: 0,
      quantity_allocated: 0
    },
    editItem: {
      category_id: '',
      item_code: '',
      item_name: '',
      brand: '',
      model: '',
      reorder_level: 10,
      quantity_available: 0,
      quantity_allocated: 0
    }
  });

  // Search and filter states
  const [inventoryFilters, setInventoryFilters] = useState({
    search: '',
    statusFilter: '',
    categoryFilter: ''
  });

  // Load data on component mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
    loadAllData();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Load users when switching to PPE management or issuances tab
  useEffect(() => {
    if ((activeTab === 'ppe-management' || activeTab === 'issuances') && users.length === 0) {
      loadUsers();
    }
  }, [activeTab]);

  // Force refresh modal when PPE issuances change
  useEffect(() => {
    if (showViewPPEModal && selectedUser && ppeIssuances.length > 0) {
      console.log('🔄 PPE issuances changed, forcing modal refresh');
      setForceModalRefresh(prev => prev + 1);
    }
  }, [ppeIssuances.length, showViewPPEModal, selectedUser]);

  // Auto-refresh user PPE when modal is open and issuances change
  useEffect(() => {
    if (showViewPPEModal && selectedUser) {
      console.log('🔄 Auto-refreshing user PPE for:', selectedUser.full_name);
      console.log('📊 Current ppeIssuances length:', ppeIssuances.length);
      console.log('📊 Current userPPE length:', userPPE.length);
      console.log('🔄 Refresh trigger:', refreshTrigger);
      console.log('🔄 Force modal refresh:', forceModalRefresh);
      
      // Force reload from server every time
      loadUserPPE(selectedUser._id.toString());
    }
  }, [showViewPPEModal, selectedUser, ppeIssuances.length, refreshTrigger, forceModalRefresh]);

  const loadAllData = async () => {
    try {
      // Load all data in parallel for better performance
      const [categoriesData, itemsData, issuancesData] = await Promise.all([
        ppeService.getPPECategories(),
        ppeService.getPPEItems(),
        ppeService.getPPEIssuances()
      ]);
      
      // Update all states at once
      console.log('📦 Loaded PPE data:', {
        categories: categoriesData.length,
        items: itemsData.length,
        issuances: issuancesData.length,
        sampleItem: itemsData[0],
        sampleCategory: categoriesData[0]
      });
      
      setPpeCategories(categoriesData);
      setPpeItems(itemsData);
      setPpeIssuances(issuancesData);
    } catch (err) {
      console.error('Error loading all data:', err);
      setError('Có lỗi khi tải dữ liệu');
    }
  };

  const forceRefresh = async () => {
    setError(null);
    await loadAllData();
  };

  const loadCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const data = await ppeService.getPPECategories();
      setPpeCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };


  // PPE Assignment handlers
  const loadUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const data = await ppeService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const loadUserPPE = async (userId: string) => {
    setLoading(prev => ({ ...prev, assignment: true }));
    try {
      const data = await ppeService.getPPEIssuancesByUser(userId);
      setUserPPE(data);
    } catch (err) {
      console.error('Error loading user PPE:', err);
      setError('Không thể tải PPE của nhân viên');
    } finally {
      setLoading(prev => ({ ...prev, assignment: false }));
    }
  };

  const handleUserSelect = (user: any) => {
    console.log('👤 Selecting user:', user.full_name);
    setSelectedUser(user);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    setForceModalRefresh(prev => prev + 1); // Force modal refresh
    loadUserPPE(user._id.toString());
    setShowViewPPEModal(true);
  };

  const handleCloseViewPPEModal = () => {
    console.log('❌ Closing View PPE modal');
    setShowViewPPEModal(false);
    setSelectedUser(null);
    setUserPPE([]);
    setRefreshTrigger(0); // Reset refresh trigger
    setForceModalRefresh(0); // Reset force modal refresh
  };

  const handleAssignPPE = (user: any) => {
    console.log('🚀 handleAssignPPE called with user:', user);
    setFormData(prev => ({ 
      ...prev, 
      issuePPE: {
        user_id: user._id.toString(),
        item_id: '',
        quantity: 1,
        issued_date: new Date().toISOString(),
        expected_return_date: '',
        issued_by: currentUser?.id || ''
      }
    }));
    // Close view PPE modal if it's open
    setShowViewPPEModal(false);
    openModal('issuePPEModal');
  };

  // Category handlers
  const handleAddCategory = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      console.log('🚀 Adding new PPE category:', formData.addCategory);
      
      const newCategory = await ppeService.createPPECategory(formData.addCategory);
      console.log('✅ PPE category created:', newCategory);
      
      // Update state immediately - no reload needed
      setPpeCategories(prev => {
        const updatedCategories = [...prev, newCategory];
        console.log('📂 Updated categories list:', updatedCategories);
        return updatedCategories;
      });
      
      closeModal();
      setFormData(prev => ({ 
        ...prev, 
        addCategory: { category_name: '', description: '', lifespan_months: 0 }
      }));
      
      console.log('✅ PPE category added successfully');
    } catch (err) {
      console.error('❌ Error adding category:', err);
      setError('Có lỗi khi tạo danh mục');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      console.log('🚀 Deleting PPE category:', categoryId);
      
      await ppeService.deletePPECategory(categoryId);
      console.log('✅ PPE category deleted');
      
      // Update state immediately - no reload needed
      setPpeCategories(prev => {
        const updatedCategories = prev.filter(category => category._id !== categoryId);
        console.log('📂 Updated categories list after deletion:', updatedCategories);
        return updatedCategories;
      });
      
      console.log('✅ PPE category deleted successfully');
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('❌ Error deleting category:', err);
      
      // Extract error message from response
      let errorMessage = 'Có lỗi khi xóa danh mục';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const handleAddItem = async () => {
    setLoading(prev => ({ ...prev, items: true }));
    try {
      console.log('🚀 Adding new PPE item:', formData.addItem);
      
      const newItem = await ppeService.createPPEItem(formData.addItem);
      console.log('✅ PPE item created:', newItem);
      
      // Update state immediately - no reload needed
      setPpeItems(prev => {
        const updatedItems = [...prev, newItem];
        console.log('📦 Updated items list:', updatedItems);
        return updatedItems;
      });
      
      closeModal();
      setFormData(prev => ({ 
        ...prev, 
        addItem: {
          category_id: '',
          item_code: '',
          item_name: '',
          brand: '',
          model: '',
          reorder_level: 10,
          quantity_available: 0,
          quantity_allocated: 0
        }
      }));
      
      console.log('✅ PPE item added successfully');
    } catch (err) {
      console.error('❌ Error adding item:', err);
      setError('Có lỗi khi tạo thiết bị');
    } finally {
      setLoading(prev => ({ ...prev, items: false }));
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem) return;
    
    setLoading(prev => ({ ...prev, items: true }));
    try {
      console.log('🚀 Editing PPE item:', selectedItem._id, 'with data:', formData.editItem);
      
      const updatedItem = await ppeService.updatePPEItem(selectedItem._id, formData.editItem);
      console.log('✅ PPE item updated:', updatedItem);
      
      // Update state immediately - no reload needed
      setPpeItems(prev => {
        const updatedItems = prev.map(item => 
          item._id === selectedItem._id ? updatedItem : item
        );
        console.log('📦 Updated items list:', updatedItems);
        return updatedItems;
      });
      
      setShowItemEditModal(false);
      setSelectedItem(null);
      
      console.log('✅ PPE item edited successfully');
    } catch (err) {
      console.error('❌ Error updating item:', err);
      setError('Có lỗi khi cập nhật thiết bị');
    } finally {
      setLoading(prev => ({ ...prev, items: false }));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;
    
    setLoading(prev => ({ ...prev, items: true }));
    try {
      console.log('🚀 Deleting PPE item:', itemId);
      
      await ppeService.deletePPEItem(itemId);
      console.log('✅ PPE item deleted');
      
      // Update state immediately - no reload needed
      setPpeItems(prev => {
        const updatedItems = prev.filter(item => item._id !== itemId);
        console.log('📦 Updated items list after deletion:', updatedItems);
        return updatedItems;
      });
      
      console.log('✅ PPE item deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting item:', err);
      setError('Có lỗi khi xóa thiết bị');
    } finally {
      setLoading(prev => ({ ...prev, items: false }));
    }
  };

  const handleUpdateItemQuantity = async (itemId: string, data: UpdateItemQuantityData) => {
    setLoading(prev => ({ ...prev, items: true }));
    try {
      console.log('🚀 Updating item quantity:', itemId, 'with data:', data);
      
      const updatedItem = await ppeService.updatePPEItemQuantity(itemId, data);
      console.log('✅ Item quantity updated:', updatedItem);
      
      // Update state immediately - no reload needed
      setPpeItems(prev => {
        const updatedItems = prev.map(item => 
          item._id === itemId ? updatedItem : item
        );
        console.log('📦 Updated items list after quantity update:', updatedItems);
        return updatedItems;
      });
      
      console.log('✅ Item quantity updated successfully');
    } catch (err) {
      console.error('❌ Error updating item quantity:', err);
      setError('Có lỗi khi cập nhật số lượng thiết bị');
    } finally {
      setLoading(prev => ({ ...prev, items: false }));
    }
  };

  const handleIssuePPE = async () => {
    setLoading(prev => ({ ...prev, issuances: true }));
    try {
      console.log('🚀 Starting PPE issuance with data:', formData.issuePPE);
      
      const newIssuance = await ppeService.createPPEIssuance(formData.issuePPE);
      console.log('✅ PPE issuance created:', newIssuance);
      
      // Update PPE item quantities immediately - this is the key fix
      const issuedItemId = formData.issuePPE.item_id;
      const issuedQuantity = formData.issuePPE.quantity;
      
      console.log('📦 Updating item quantities for:', issuedItemId, 'quantity:', issuedQuantity);
      
      // Update PPE items state immediately
      setPpeItems(prev => {
        const updatedItems = prev.map(item => {
          if (item._id === issuedItemId) {
            const updatedItem = {
              ...item,
              quantity_available: Math.max(0, (item.quantity_available || 0) - issuedQuantity),
              quantity_allocated: (item.quantity_allocated || 0) + issuedQuantity,
              remaining_quantity: Math.max(0, (item.remaining_quantity || item.quantity_available || 0) - issuedQuantity),
              actual_allocated_quantity: (item.actual_allocated_quantity || item.quantity_allocated || 0) + issuedQuantity
            };
            console.log('🔄 Updated item:', updatedItem);
            return updatedItem;
          }
          return item;
        });
        console.log('📊 All items after update:', updatedItems);
        return updatedItems;
      });
      
      // Update PPE issuances state immediately
      setPpeIssuances(prev => {
        const updatedIssuances = [...prev, newIssuance];
        console.log('📋 Updated issuances:', updatedIssuances);
        return updatedIssuances;
      });
      
      // If we have a selected user, update their PPE data immediately
      if (selectedUser) {
        console.log('🔄 Updating userPPE for selected user:', selectedUser.full_name);
        console.log('📦 New issuance data:', newIssuance);
        console.log('📋 Current userPPE before update:', userPPE);
        
        setUserPPE(prev => {
          const updatedUserPPE = [...prev, newIssuance];
          console.log('👤 Updated user PPE immediately:', updatedUserPPE);
          return updatedUserPPE;
        });
      }
      
      closeModal();
      setFormData(prev => ({ 
        ...prev, 
        issuePPE: {} as CreateIssuanceData
      }));
      
      // If we have a selected user, keep modal open and refresh data
      if (selectedUser) {
        console.log('🔄 Keeping modal open and refreshing data for user:', selectedUser.full_name);
        console.log('📊 Current showViewPPEModal state:', showViewPPEModal);
        
        // Trigger refresh by updating both triggers
        setRefreshTrigger(prev => prev + 1);
        setForceModalRefresh(prev => prev + 1);
        
        // Force reload user PPE from server without closing modal
        setTimeout(async () => {
          console.log('🔄 Force reloading user PPE from server');
          await loadUserPPE(selectedUser._id.toString());
        }, 200); // Small delay to ensure state updates are processed
      }
      
      // Show success message
      setError(null);
      console.log('✅ PPE issuance completed successfully');
      
    } catch (err) {
      console.error('❌ Error issuing PPE:', err);
      setError('Có lỗi khi phát PPE');
    } finally {
      setLoading(prev => ({ ...prev, issuances: false }));
    }
  };

  // Utility functions
  const getFilteredItems = () => {
    return ppeItems.filter(item => {
      if (inventoryFilters.search) {
        const searchTerm = inventoryFilters.search.toLowerCase();
        if (!item.item_name.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      if (inventoryFilters.categoryFilter) {
        if ((typeof item.category_id === 'string' ? item.category_id : item.category_id?._id) !== inventoryFilters.categoryFilter) {
          return false;
        }
      }
      
      if (inventoryFilters.statusFilter) {
        const stockStatus = getStockStatus(item);
        
        if (inventoryFilters.statusFilter === 'low' && stockStatus !== 'low') return false;
        if (inventoryFilters.statusFilter === 'out' && stockStatus !== 'out') return false;
        if (inventoryFilters.statusFilter === 'good' && stockStatus !== 'good') return false;
      }
      
      return true;
    });
  };

  const getFilteredCategories = () => {
    return ppeCategories.filter(category => {
      if (inventoryFilters.search) {
        const searchTerm = inventoryFilters.search.toLowerCase();
        if (!category.category_name.toLowerCase().includes(searchTerm) &&
            !category.description.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      return true;
    });
  };

  const getCategoryIcon = (categoryId: string): string => {
    const icons: { [key: string]: string } = {
      '68ce529c013e99c5ff884ec1': 'fas fa-hard-hat', // Bảo vệ đầu
      '68ce529c013e99c5ff884ec2': 'fas fa-glasses', // Bảo vệ mắt
      '68ce529c013e99c5ff884ec3': 'fas fa-head-side-mask', // Bảo vệ hô hấp
      '68ce529c013e99c5ff884ec4': 'fas fa-mitten', // Bảo vệ chân tay
      '68ce529c013e99c5ff884ec5': 'fas fa-shoe-prints', // Bảo vệ chân
      '68ce529c013e99c5ff884ec6': 'fas fa-tshirt', // Bảo vệ cơ thể
      '68ce529c013e99c5ff884ec7': 'fas fa-volume-up', // Bảo vệ thính giác
    };
    return icons[categoryId] || 'fas fa-shield-alt';
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryItems = ppeItems.filter(item => {
      // Handle both string and object category_id
      const itemCategoryId = typeof item.category_id === 'string' 
        ? item.category_id 
        : item.category_id?._id;
      return itemCategoryId === categoryId;
    });
    
    console.log(`📊 Category ${categoryId} stats:`, {
      categoryId,
      totalItems: categoryItems.length,
      items: categoryItems.map(item => ({
        id: item._id,
        name: item.item_name,
        category_id: item.category_id,
        quantity_available: item.quantity_available,
        quantity_allocated: item.quantity_allocated
      }))
    });
    
    const totalItems = categoryItems.length;
    const totalQuantity = categoryItems.reduce((sum, item) => sum + (item.total_quantity || (item.quantity_available + item.quantity_allocated)), 0);
    const totalRemaining = categoryItems.reduce((sum, item) => sum + (item.remaining_quantity || item.quantity_available), 0);
    const totalAllocated = categoryItems.reduce((sum, item) => sum + (item.actual_allocated_quantity || item.quantity_allocated), 0);
    const lowStockItems = categoryItems.filter(item => (item.remaining_quantity || item.quantity_available) <= (item.reorder_level || 0)).length;
    
    return {
      totalItems,
      totalQuantity,
      totalRemaining,
      totalAllocated,
      lowStockItems
    };
  };

  const getStockStatus = (item: PPEItem): string => {
    const remainingQuantity = item.remaining_quantity || item.quantity_available;
    if (remainingQuantity === 0) return 'out';
    if (remainingQuantity <= item.reorder_level) return 'low';
    return 'good';
  };

  const getStockStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      'out': 'Hết hàng',
      'low': 'Sắp hết',
      'good': 'Còn hàng'
    };
    return labels[status] || 'Không xác định';
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  const openModal = (modalName: string) => {
    setShowModal(modalName);
  };

  const closeModal = () => {
    setShowModal(null);
  };

  return (
    <div className="ppe-management-container">
      <div className="ppe-content">
        {/* Enhanced Header */}
        <div className="header">
          <div>
            <h1>
              <i className="fas fa-hard-hat"></i>
              Quản lý PPE
            </h1>
            <div className="breadcrumb">
              <a href="/admin">
                <i className="fas fa-home"></i>
                Trang chủ
              </a>
              <i className="fas fa-chevron-right"></i>
              <span>Quản lý PPE</span>
            </div>
          </div>
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={forceRefresh}
              disabled={Object.values(loading).some(l => l)}
            >
              <i className="fas fa-sync-alt"></i>
              Làm mới
            </button>
          </div>
        </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button onClick={() => setError(null)} className="alert-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

        {/* Enhanced Tabs */}
      <div className="tabs">
        <div className="tab-nav">
          <button 
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
          >
              <i className="fas fa-list"></i>
              Danh mục
          </button>
          <button 
              className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
          >
              <i className="fas fa-box"></i>
              Thiết bị
          </button>
          <button 
              className={`tab-button ${activeTab === 'ppe-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('ppe-management')}
          >
              <i className="fas fa-hand-holding"></i>
              Phát PPE
          </button>
          <button 
              className={`tab-button ${activeTab === 'issuances' ? 'active' : ''}`}
              onClick={() => setActiveTab('issuances')}
          >
              <i className="fas fa-clipboard-list"></i>
              Lịch sử phát
          </button>
        </div>

          {/* Categories Tab */}
          {activeTab === 'categories' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Tìm kiếm danh mục..."
                      value={inventoryFilters.search}
                      onChange={(e) => setInventoryFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>
              </div>
                <div className="action-buttons">
                  <button 
                    className="btn btn-success"
                    onClick={() => openModal('addCategoryModal')}
                  >
                    <i className="fas fa-plus"></i>
                    Thêm danh mục
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={() => setShowImportCategoriesModal(true)}
                  >
                    <i className="fas fa-file-excel"></i>
                    Import Excel
                  </button>
                </div>
            </div>

              {loading.categories ? (
                <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : (
                <div className="data-grid">
                  {getFilteredCategories().map((category: PPECategory) => (
                    <div key={category._id} className="ppe-card">
                    <div className="card-header">
                        <div className="card-title">
                          <i className="fas fa-tag"></i>
                          {category.category_name}
                        </div>
                      <div className="ppe-icon">
                          <i className={getCategoryIcon(category._id)}></i>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="ppe-info">
                        <div className="info-item">
                            <i className="fas fa-info-circle"></i>
                            <span>{category.description}</span>
                        </div>
                          {category.lifespan_months && (
                        <div className="info-item">
                              <i className="fas fa-clock"></i>
                              <span>{category.lifespan_months} tháng</span>
                        </div>
                          )}
                      </div>
                      
                      <div className="stock-status">
                          <div className="stock-title">
                            <i className="fas fa-chart-bar"></i>
                            Thống kê
                          </div>
                          {(() => {
                            const stats = getCategoryStats(category._id);
                            return (
                              <>
                        <div className="stock-row">
                                  <span>Tổng thiết bị:</span>
                                  <strong>{stats.totalItems}</strong>
                        </div>
                                <div className="stock-row">
                                  <span>Tổng số lượng:</span>
                                  <strong>{stats.totalQuantity}</strong>
                        </div>
                        <div className="stock-row">
                          <span>Còn lại:</span>
                                  <strong>{stats.totalRemaining}</strong>
                        </div>
                                <div className="stock-row">
                                  <span>Đã phát:</span>
                                  <strong>{stats.totalAllocated}</strong>
                        </div>
                                {stats.lowStockItems > 0 && (
                                  <div className="stock-row warning">
                                    <span>Cảnh báo:</span>
                                    <strong>{stats.lowStockItems} thiết bị</strong>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                      </div>
                      
                      <div className="card-actions">
                          <button 
                            className="btn btn-info btn-sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDetailModal(true);
                            }}
                          >
                            <i className="fas fa-eye"></i>
                            Chi tiết
                        </button>
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryEditModal(true);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                            Sửa
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          <i className="fas fa-trash"></i>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
            </div>
            )}
          </div>
        )}

          {/* Items Tab */}
          {activeTab === 'items' && (
          <div className="tab-content active">
              <div className="section-header">
                <h2>Thiết bị PPE</h2>
                <div className="header-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => openModal('addItemModal')}
                  >
                    <i className="fas fa-plus"></i>
                    Thêm thiết bị
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={() => setShowImportItemsModal(true)}
                  >
                    <i className="fas fa-file-excel"></i>
                    Import Excel
                  </button>
                </div>
                <div className="header-filters">
                  <input
                    type="text"
                    placeholder="Tìm kiếm thiết bị..."
                    value={inventoryFilters.search}
                    onChange={(e) => setInventoryFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="form-input"
                  />
                  <select
                    value={inventoryFilters.categoryFilter}
                    onChange={(e) => setInventoryFilters(prev => ({ ...prev, categoryFilter: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Tất cả danh mục</option>
                    {ppeCategories.map((category: PPECategory) => (
                      <option key={category._id} value={category._id}>
                        {category.category_name}
                    </option>
                  ))}
                </select>
                  <select
                    value={inventoryFilters.statusFilter}
                    onChange={(e) => setInventoryFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="good">Còn hàng</option>
                    <option value="low">Sắp hết</option>
                    <option value="out">Hết hàng</option>
                </select>
                </div>
              </div>
              
              {/* Statistics */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-box"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{ppeItems.length}</div>
                    <div className="stat-label">Tổng thiết bị</div>
                  </div>
            </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {ppeItems.reduce((sum, item) => sum + (item.remaining_quantity || item.quantity_available), 0)}
                    </div>
                    <div className="stat-label">Còn lại</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {getFilteredItems().filter(item => {
                        const remainingQuantity = item.remaining_quantity || item.quantity_available;
                        return remainingQuantity <= item.reorder_level;
                      }).length}
                    </div>
                    <div className="stat-label">Cảnh báo tồn kho</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-hand-holding"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {ppeItems.reduce((sum, item) => sum + (item.actual_allocated_quantity || item.quantity_allocated), 0)}
                    </div>
                    <div className="stat-label">Đã phát</div>
                  </div>
                </div>
              </div>

              {loading.items ? (
                <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : (
                <div className="data-grid">
                  {getFilteredItems().map(item => {
                    const stockStatus = getStockStatus(item);
                
                return (
                      <div key={item._id} className="ppe-card">
                    <div className="card-header">
                      <div className="card-title">
                            {item.item_name}
                      </div>
                      <div className="ppe-icon">
                            <i className={getCategoryIcon(typeof item.category_id === 'string' ? item.category_id : item.category_id?._id)}></i>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="ppe-info">
                        <div className="info-item">
                          <i className="fas fa-code"></i>
                              <span>{item.item_code}</span>
                        </div>
                            <div className="info-item">
                              <i className="fas fa-tag"></i>
                              <span>{typeof item.category_id === 'string' 
                                ? ppeCategories.find(cat => cat._id === item.category_id)?.category_name || 'Không xác định'
                                : item.category_id?.category_name || 'Không xác định'}</span>
                            </div>
                            {item.brand && (
                              <div className="info-item">
                                <i className="fas fa-industry"></i>
                                <span>{item.brand}</span>
                              </div>
                            )}
                            {item.model && (
                              <div className="info-item">
                                <i className="fas fa-cog"></i>
                                <span>{item.model}</span>
                              </div>
                            )}
                        <div className="info-item">
                          <i className="fas fa-calendar"></i>
                              <span>{formatDateTime(item.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="stock-status">
                        <div className="stock-title">Tình trạng kho</div>
                        <div className="stock-row">
                          <span>Tổng số:</span>
                          <span>{item.total_quantity || (item.quantity_available + item.quantity_allocated)}</span>
                        </div>
                        <div className="stock-row">
                          <span>Còn lại:</span>
                          <span>{item.remaining_quantity || item.quantity_available}</span>
                        </div>
                        <div className="stock-row">
                          <span>Đã phát:</span>
                          <span>{item.actual_allocated_quantity || item.quantity_allocated}</span>
                        </div>
                        <div className="stock-row">
                          <span>Tối thiểu:</span>
                          <span>{item.reorder_level}</span>
                        </div>
                        <div className={`stock-alert alert-${stockStatus}`}>
                          {getStockStatusLabel(stockStatus)}
                        </div>
                      </div>
                      
                      <div className="card-actions">
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  editItem: {
                                    category_id: typeof item.category_id === 'string' ? item.category_id : item.category_id?._id,
                                    item_code: item.item_code,
                                    item_name: item.item_name,
                                    brand: item.brand || '',
                                    model: item.model || '',
                                    reorder_level: item.reorder_level,
                                    quantity_available: item.quantity_available,
                                    quantity_allocated: item.quantity_allocated
                                  }
                                }));
                                setShowItemEditModal(true);
                              }}
                            >
                              <i className="fas fa-edit"></i> Sửa
                        </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              <i className="fas fa-trash"></i> Xóa
                        </button>
                      </div>
                          
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

          {/* PPE Management Tab */}
          {activeTab === 'ppe-management' && (
          <div className="tab-content active">
              <div className="ppe-assignment-section">
                <div className="section-header">
                  <h2>Phát PPE cho nhân viên</h2>
              </div>
              
                <div className="user-selection">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhân viên..."
                      value={assignmentSearchTerm}
                      onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                      className="form-input"
                    />
            </div>

                  {loading.users ? (
                    <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                      <span>Đang tải danh sách nhân viên...</span>
              </div>
            ) : (
                    <div className="user-grid">
                      {users
                        .filter(user => 
                          (user.full_name || '').toLowerCase().includes(assignmentSearchTerm.toLowerCase())
                        )
                        .map(user => (
                          <div key={user._id} className="user-card">
                            <div className="user-info">
                              <div className="user-name">{user.full_name}</div>
                              <div className="user-department">
                                {user.department_id?.department_name || 
                                 user.department_id?.name || 
                                 (typeof user.department_id === 'string' ? user.department_id : 'Không xác định')}
                              </div>
              </div>
                            <div className="user-actions">
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUserSelect(user)}
                              >
                                <i className="fas fa-eye"></i> Xem PPE
                              </button>
                          <button 
                            className="btn btn-success btn-sm"
                                onClick={() => handleAssignPPE(user)}
                          >
                                <i className="fas fa-plus"></i> Phát PPE
                          </button>
                            </div>
                          </div>
                        ))}
            </div>
            )}
          </div>

              </div>
          </div>
        )}

          {/* Issuances Tab */}
          {activeTab === 'issuances' && (
          <div className="tab-content active">
              <div className="section-header">
                <h2>Lịch sử phát PPE</h2>
                <div className="header-filters">
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên hoặc thiết bị..."
                    value={inventoryFilters.search}
                    onChange={(e) => setInventoryFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="form-input"
                  />
                  <select
                    value={inventoryFilters.statusFilter}
                    onChange={(e) => setInventoryFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="issued">Đang sử dụng</option>
                    <option value="returned">Đã trả</option>
                    <option value="overdue">Quá hạn</option>
                  </select>
                </div>
                </div>
                
              {/* Statistics for Issuances */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-hand-holding"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{ppeIssuances.length}</div>
                    <div className="stat-label">Tổng lượt phát</div>
                  </div>
              </div>
              
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-user-check"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {ppeIssuances.filter(issuance => issuance.status === 'issued').length}
                    </div>
                    <div className="stat-label">Đang sử dụng</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {ppeIssuances.filter(issuance => issuance.status === 'returned').length}
                    </div>
                    <div className="stat-label">Đã trả</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {ppeIssuances.filter(issuance => issuance.status === 'overdue').length}
                    </div>
                    <div className="stat-label">Quá hạn</div>
                  </div>
                </div>
            </div>

            {loading.issuances ? (
                <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : (
                <div className="issuances-list">
                  {ppeIssuances
                    .filter(issuance => {
                      // Filter by search term
                      if (inventoryFilters.search) {
                        const searchTerm = inventoryFilters.search.toLowerCase();
                        const userName = typeof issuance.user_id === 'object' && issuance.user_id ? 
                          issuance.user_id.full_name : 
                          issuance.user_id ? users.find(user => user._id.toString() === issuance.user_id.toString())?.full_name || '' : '';
                        const itemName = typeof issuance.item_id === 'object' ? 
                          issuance.item_id.item_name : 
                          ppeItems.find(item => item._id === issuance.item_id)?.item_name || '';
                        
                        if (!userName.toLowerCase().includes(searchTerm) && 
                            !itemName.toLowerCase().includes(searchTerm)) {
                          return false;
                        }
                      }
                      
                      // Filter by status
                      if (inventoryFilters.statusFilter && issuance.status !== inventoryFilters.statusFilter) {
                        return false;
                      }
                      
                      return true;
                    })
                    .map(issuance => {
                      const user = typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id : 
                        issuance.user_id ? users.find(user => user._id.toString() === issuance.user_id.toString()) : null;
                      const item = typeof issuance.item_id === 'object' && issuance.item_id ? issuance.item_id : 
                        issuance.item_id ? ppeItems.find(item => item._id === issuance.item_id) : null;
                      const isOverdue = new Date(issuance.expected_return_date) < new Date() && issuance.status === 'issued';
                      
                      return (
                        <div key={issuance._id} className="issuance-item">
                          <div className="issuance-info">
                            <div className="issuance-user">
                              <i className="fas fa-user"></i>
                              <strong>{user?.full_name || 'Không xác định'}</strong>
                            </div>
                            <div className="issuance-item-name">
                              <i className="fas fa-box"></i>
                              {item?.item_name || 'Không xác định'}
                              <span className="item-code">({item?.item_code || 'N/A'})</span>
                            </div>
                            <div className="issuance-details">
                              <div className="detail-item">
                                <i className="fas fa-hashtag"></i>
                                <span>Số lượng: <strong>{issuance.quantity || 0}</strong></span>
                              </div>
                              <div className="detail-item">
                                <i className="fas fa-calendar-plus"></i>
                                <span>Ngày phát: <strong>{issuance.issued_date ? formatDateTime(issuance.issued_date) : 'N/A'}</strong></span>
                              </div>
                              <div className="detail-item">
                                <i className="fas fa-calendar-check"></i>
                                <span>Hạn trả: <strong>{issuance.expected_return_date ? formatDateTime(issuance.expected_return_date) : 'N/A'}</strong></span>
                              </div>
                              {issuance.issued_by && (
                                <div className="detail-item">
                                  <i className="fas fa-user-tie"></i>
                                  <span>Người phát: <strong>{typeof issuance.issued_by === 'object' ? 
                                    (issuance.issued_by as any)?.full_name || 
                                    'Không xác định' : 
                                    String(issuance.issued_by)}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="issuance-status">
                            <span className={`status-badge status-${issuance.status} ${isOverdue ? 'overdue' : ''}`}>
                              {issuance.status === 'issued' ? 
                                (isOverdue ? 'Quá hạn' : 'Đang sử dụng') : 
                               issuance.status === 'returned' ? 'Đã trả' : 'Quá hạn'}
                            </span>
                            {isOverdue && (
                              <div className="overdue-warning">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>Quá hạn trả</span>
          </div>
        )}
      </div>
                        </div>
                      );
                    })}
                  
                  {ppeIssuances.length === 0 && (
                    <div className="empty-state">
                      <i className="fas fa-clipboard-list"></i>
                      <p>Chưa có lịch sử phát PPE nào</p>
                    </div>
                  )}
            </div>
            )}
          </div>
        )}
      </div>
      </div>
      {/* Modals */}
      {showModal === 'addCategoryModal' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm danh mục PPE</h3>
              <button onClick={closeModal} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddCategory();
            }}>
                <div className="form-group">
                <label className="form-label">Tên danh mục</label>
                  <input 
                    type="text" 
                    className="form-input" 
                  value={formData.addCategory.category_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    addCategory: { ...prev.addCategory, category_name: e.target.value }
                  }))}
                    required 
                  />
                </div>
                
                <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea 
                  className="form-textarea" 
                  value={formData.addCategory.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    addCategory: { ...prev.addCategory, description: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="form-group">
                <label className="form-label">Tuổi thọ (tháng)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                  value={formData.addCategory.lifespan_months}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    addCategory: { ...prev.addCategory, lifespan_months: parseInt(e.target.value) || 0 }
                    }))}
                  />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading.categories}>
                  {loading.categories ? 'Đang tạo...' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'updateQuantityModal' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật số lượng</h3>
              <button onClick={closeModal} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const itemId = (form.querySelector('input[name="itemId"]') as HTMLInputElement)?.value;
              if (itemId) {
                handleUpdateItemQuantity(itemId, formData.updateQuantity);
              }
              closeModal();
            }}>
              <input type="hidden" name="itemId" value="" />
                
                <div className="form-group">
                <label className="form-label">Số lượng có sẵn</label>
                <input 
                  type="number" 
                    className="form-input" 
                  value={formData.updateQuantity.quantity_available}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    updateQuantity: { ...prev.updateQuantity, quantity_available: parseInt(e.target.value) || 0 }
                  }))}
                  min="0"
                    required 
                />
                </div>
                
                <div className="form-group">
                <label className="form-label">Số lượng đã phân phối</label>
                  <input 
                    type="number" 
                    className="form-input" 
                  value={formData.updateQuantity.quantity_allocated}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    updateQuantity: { ...prev.updateQuantity, quantity_allocated: parseInt(e.target.value) || 0 }
                    }))}
                  min="0"
                  required
                  />
                </div>
                
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading.items}>
                  {loading.items ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'issuePPEModal' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phát PPE</h3>
              <button onClick={closeModal} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleIssuePPE();
            }}>
                <div className="form-group">
                <label className="form-label">Thiết bị</label>
                  <select 
                  className="form-select" 
                  value={formData.issuePPE.item_id}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      issuePPE: { ...prev.issuePPE, item_id: e.target.value }
                    }))}
                  required
                  >
                  <option value="">Chọn thiết bị</option>
                  {ppeItems.map(item => {
                      const availableQuantity = item.remaining_quantity || item.quantity_available || 0;
                      return (
                        <option key={item._id} value={item._id}>
                          {item.item_name} (Còn: {availableQuantity})
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="form-group">
                <label className="form-label">Số lượng</label>
                  <input 
                    type="number" 
                    className="form-input" 
                  value={formData.issuePPE.quantity}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    issuePPE: { ...prev.issuePPE, quantity: parseInt(e.target.value) || 1 }
                    }))}
                  min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                <label className="form-label">Ngày trả dự kiến</label>
                  <input 
                    type="date" 
                    className="form-input" 
                  value={formData.issuePPE.expected_return_date}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      issuePPE: { ...prev.issuePPE, expected_return_date: e.target.value }
                    }))}
                  required
                  />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading.issuances}>
                  {loading.issuances ? 'Đang phát...' : 'Phát PPE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showModal === 'addItemModal' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm thiết bị PPE</h3>
              <button onClick={closeModal} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddItem();
            }}>
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select 
                  className="form-select" 
                  value={formData.addItem.category_id}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      addItem: { ...prev.addItem, category_id: e.target.value }
                    }))}
                  required
                  >
                  <option value="">Chọn danh mục</option>
                  {ppeCategories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              
              <div className="form-group">
                <label className="form-label">Mã thiết bị</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.addItem.item_code}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    addItem: { ...prev.addItem, item_code: e.target.value.toUpperCase() }
                  }))}
                  placeholder="VD: HELMET-001"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tên thiết bị</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.addItem.item_name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    addItem: { ...prev.addItem, item_name: e.target.value }
                  }))}
                  required 
                />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Thương hiệu</label>
                  <input 
                    type="text" 
                    className="form-input" 
                  value={formData.addItem.brand}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      addItem: { ...prev.addItem, brand: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input 
                    type="text" 
                    className="form-input" 
                  value={formData.addItem.model}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      addItem: { ...prev.addItem, model: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="form-group">
                <label className="form-label">Mức tái đặt hàng</label>
                  <input 
                    type="number" 
                    className="form-input" 
                  value={formData.addItem.reorder_level}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    addItem: { ...prev.addItem, reorder_level: parseInt(e.target.value) || 10 }
                  }))}
                    min="0" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Số lượng có sẵn</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.addItem.quantity_available}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    addItem: { ...prev.addItem, quantity_available: parseInt(e.target.value) || 0 }
                    }))}
                  min="0"
                  required
                  />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading.items}>
                  {loading.items ? 'Đang tạo...' : 'Tạo thiết bị'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showItemEditModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowItemEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa thiết bị PPE</h3>
              <button onClick={() => setShowItemEditModal(false)} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditItem();
            }}>
                <div className="form-group">
                <label className="form-label">Danh mục</label>
                  <select 
                  className="form-select" 
                  value={formData.editItem.category_id}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    editItem: { ...prev.editItem, category_id: e.target.value }
                  }))}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {ppeCategories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                <label className="form-label">Mã thiết bị</label>
                <input 
                  type="text" 
                    className="form-input" 
                  value={formData.editItem.item_code}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    editItem: { ...prev.editItem, item_code: e.target.value.toUpperCase() }
                  }))}
                  required 
                />
                </div>
                
                <div className="form-group">
                <label className="form-label">Tên thiết bị</label>
                  <input 
                  type="text" 
                    className="form-input" 
                  value={formData.editItem.item_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    editItem: { ...prev.editItem, item_name: e.target.value }
                    }))}
                  required 
                  />
              </div>
              
              <div className="form-group">
                <label className="form-label">Thương hiệu</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.editItem.brand}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    editItem: { ...prev.editItem, brand: e.target.value }
                  }))}
                />
              </div>
              
                <div className="form-group">
                <label className="form-label">Model</label>
                  <input 
                  type="text" 
                    className="form-input" 
                  value={formData.editItem.model}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    editItem: { ...prev.editItem, model: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="form-group">
                <label className="form-label">Mức tái đặt hàng</label>
                <input 
                  type="number" 
                    className="form-input" 
                  value={formData.editItem.reorder_level}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    editItem: { ...prev.editItem, reorder_level: parseInt(e.target.value) || 10 }
                  }))}
                  min="0"
                  required
                />
                </div>
                
                <div className="form-group">
                <label className="form-label">Số lượng có sẵn</label>
                  <input 
                    type="number" 
                    className="form-input" 
                  value={formData.editItem.quantity_available}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    editItem: { ...prev.editItem, quantity_available: parseInt(e.target.value) || 0 }
                    }))}
                  min="0"
                  required
                  />
                </div>
                
                <div className="form-group">
                <label className="form-label">Số lượng đã phân phối</label>
                  <input 
                  type="number" 
                    className="form-input" 
                  value={formData.editItem.quantity_allocated}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                    editItem: { ...prev.editItem, quantity_allocated: parseInt(e.target.value) || 0 }
                    }))}
                  min="0"
                  required
                  />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowItemEditModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading.items}>
                  {loading.items ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modals */}
      {showCategoryDetailModal && selectedCategory && (
        <CategoryDetailModal
          category={selectedCategory}
          ppeItems={ppeItems}
          isOpen={showCategoryDetailModal}
          onClose={() => setShowCategoryDetailModal(false)}
        />
      )}

      {showCategoryEditModal && selectedCategory && (
        <CategoryEditModal
          category={selectedCategory}
          isOpen={showCategoryEditModal}
          onClose={() => setShowCategoryEditModal(false)}
          onUpdate={async (updatedCategory) => {
            try {
              await ppeService.updatePPECategory(selectedCategory!._id, updatedCategory);
              await loadCategories();
              setShowCategoryEditModal(false);
            } catch (err) {
              setError('Có lỗi khi cập nhật danh mục');
            }
          }}
        />
      )}

      {/* View PPE Modal */}
      {showViewPPEModal && selectedUser && (
        <div className="modal-overlay" onClick={handleCloseViewPPEModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()} key={`modal-${selectedUser._id}-${forceModalRefresh}`}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-hard-hat"></i>
                PPE của {selectedUser.full_name}
              </h3>
              <div className="modal-header-actions">
                <button 
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered');
                    setRefreshTrigger(prev => prev + 1);
                    setForceModalRefresh(prev => prev + 1);
                    loadUserPPE(selectedUser._id.toString());
                  }} 
                  className="btn btn-sm btn-primary"
                  disabled={loading.assignment}
                  title="Làm mới dữ liệu"
                >
                  <i className={`fas fa-sync-alt ${loading.assignment ? 'fa-spin' : ''}`}></i>
                </button>
                <button onClick={handleCloseViewPPEModal} className="modal-close">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="user-info-header">
                <div className="user-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="user-details">
                  <h4>{selectedUser.full_name}</h4>
                  <p className="user-department">
                    <i className="fas fa-building"></i>
                    {selectedUser.department_id?.department_name || 'Không xác định'}
                  </p>
                  <p className="user-position">
                    <i className="fas fa-briefcase"></i>
                    {selectedUser.position || 'Không xác định'}
                  </p>
                </div>
              </div>

              {loading.assignment ? (
                <div className="loading-container">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang tải PPE của nhân viên...</span>
                </div>
              ) : (
                <div className="ppe-list-modal">
                  {userPPE.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <h4>Chưa có PPE</h4>
                      <p>Nhân viên chưa được phát PPE nào</p>
                    </div>
                  ) : (
                    <div className="ppe-grid">
                      {userPPE.map(ppe => (
                        <div key={ppe._id} className="ppe-card-modal">
                          <div className="ppe-card-header">
                            <div className="ppe-icon">
                              <i className="fas fa-shield-alt"></i>
                            </div>
                            <div className="ppe-name">
                              {typeof ppe.item_id === 'object' && ppe.item_id ? ppe.item_id.item_name : 
                               ppe.item_id ? ppeItems.find(item => item._id === ppe.item_id)?.item_name || 'Không xác định' : 'Không xác định'}
                            </div>
                            <div className="ppe-status">
                              <span className={`status-badge status-${ppe.status}`}>
                                {ppe.status === 'issued' ? 'Đang sử dụng' : 
                                 ppe.status === 'returned' ? 'Đã trả' : 'Quá hạn'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="ppe-card-body">
                            <div className="ppe-details">
                              <div className="detail-row">
                                <i className="fas fa-hashtag"></i>
                                <span>Số lượng: <strong>{ppe.quantity || 0}</strong></span>
                              </div>
                              <div className="detail-row">
                                <i className="fas fa-calendar-plus"></i>
                                <span>Ngày phát: <strong>{ppe.issued_date ? formatDateTime(ppe.issued_date) : 'N/A'}</strong></span>
                              </div>
                              <div className="detail-row">
                                <i className="fas fa-calendar-check"></i>
                                <span>Hạn trả: <strong>{ppe.expected_return_date ? formatDateTime(ppe.expected_return_date) : 'N/A'}</strong></span>
                              </div>
                              {typeof ppe.item_id === 'object' && ppe.item_id.item_code && (
                                <div className="detail-row">
                                  <i className="fas fa-barcode"></i>
                                  <span>Mã thiết bị: <strong>{ppe.item_id.item_code}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={handleCloseViewPPEModal} 
                className="btn btn-secondary"
              >
                <i className="fas fa-times"></i>
                Đóng
              </button>
              <button 
                type="button" 
                onClick={() => handleAssignPPE(selectedUser)} 
                className="btn btn-success"
              >
                <i className="fas fa-plus"></i>
                Phát thêm PPE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Categories Modal */}
      <ImportCategoriesModal
        isOpen={showImportCategoriesModal}
        onClose={() => setShowImportCategoriesModal(false)}
        onImportSuccess={() => {
          loadCategories();
          setShowImportCategoriesModal(false);
        }}
      />

      {/* Import Items Modal */}
      <ImportItemsModal
        isOpen={showImportItemsModal}
        onClose={() => setShowImportItemsModal(false)}
        onImportSuccess={() => {
          loadAllData();
          setShowImportItemsModal(false);
        }}
      />
    </div>
  );
};

export default PPEManagement;

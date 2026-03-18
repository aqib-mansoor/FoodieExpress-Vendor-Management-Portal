import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/Table";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Edit, Plus, Search, Trash2, Upload, Zap, X, AlertCircle, ChevronLeft, ChevronRight, Eye, Image as ImageIcon } from "lucide-react";
import { dataService } from "../services/dataService";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  images?: string[];
}

const getStockBadge = (status: string) => {
  switch (status) {
    case "Active": return <Badge variant="success">{status}</Badge>;
    case "Low Stock": return <Badge variant="warning">{status}</Badge>;
    case "Out of Stock": return <Badge variant="destructive">{status}</Badge>;
    default: return <Badge variant="default">{status}</Badge>;
  }
};

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    status: "Active",
    images: [] as string[]
  });

  const productImagesInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // Alert Modal State
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });

  // Gallery Modal State
  const [galleryModal, setGalleryModal] = useState<{
    isOpen: boolean;
    product: Product | null;
    currentIndex: number;
  }>({
    isOpen: false,
    product: null,
    currentIndex: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await dataService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await dataService.deleteProduct(id);
          setProducts(products.filter(p => p.id !== id));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting product:', error);
          setAlertModal({ isOpen: true, title: "Error", message: "Failed to delete product." });
        }
      }
    });
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.status,
        images: product.images || []
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", category: "", price: 0, stock: 0, status: "Active", images: [] });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const openGallery = (product: Product) => {
    if (product.images && product.images.length > 0) {
      setGalleryModal({
        isOpen: true,
        product,
        currentIndex: 0
      });
    }
  };

  const nextImage = () => {
    if (galleryModal.product?.images) {
      setGalleryModal(prev => ({
        ...prev,
        currentIndex: (prev.currentIndex + 1) % (prev.product?.images?.length || 1)
      }));
    }
  };

  const prevImage = () => {
    if (galleryModal.product?.images) {
      setGalleryModal(prev => ({
        ...prev,
        currentIndex: (prev.currentIndex - 1 + (prev.product?.images?.length || 1)) % (prev.product?.images?.length || 1)
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const updated = await dataService.updateProduct(editingProduct.id, formData);
        setProducts(products.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await dataService.addProduct(formData);
        setProducts([...products, created]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setAlertModal({ isOpen: true, title: "Error", message: "Failed to save product." });
    }
  };

  const handleCreateFlashSaleClick = () => {
    setConfirmModal({
      isOpen: true,
      title: "Create Flash Sale",
      message: "This will apply a 20% discount to all Active products. Continue?",
      onConfirm: async () => {
        try {
          const activeProducts = products.filter(p => p.status === "Active");
          const updatedProducts = await Promise.all(activeProducts.map(async (p) => {
            const discountedPrice = Math.round(p.price * 0.8);
            return await dataService.updateProduct(p.id, { ...p, price: discountedPrice });
          }));
          
          const newProducts = products.map(p => {
            const updated = updatedProducts.find(up => up.id === p.id);
            return updated ? updated : p;
          });
          setProducts(newProducts);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setAlertModal({ isOpen: true, title: "Success", message: "Flash sale activated! 20% discount applied to active products." });
        } catch (error) {
          console.error('Error creating flash sale:', error);
          setAlertModal({ isOpen: true, title: "Error", message: "Failed to create flash sale." });
        }
      }
    });
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      
      const newProductsData = lines.slice(1).filter(line => line.trim() !== '').map(line => {
        const [name, category, price, stock, status] = line.split(',');
        return {
          name: name?.trim(),
          category: category?.trim(),
          price: Number(price?.trim() || 0),
          stock: Number(stock?.trim() || 0),
          status: status?.trim() || 'Active'
        };
      });

      try {
        const createdProducts = await Promise.all(newProductsData.map(async (data) => {
          return await dataService.addProduct(data);
        }));
        
        setProducts([...products, ...createdProducts]);
        setAlertModal({ isOpen: true, title: "Success", message: `Successfully imported ${createdProducts.length} products!` });
      } catch (error) {
        console.error('Error importing products:', error);
        setAlertModal({ isOpen: true, title: "Error", message: "Failed to import some products." });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-gray-500">Manage your menu items, pricing, and inventory.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100" onClick={handleCreateFlashSaleClick}>
            <Zap className="mr-2 h-4 w-4" />
            Create Flash Sale
          </Button>
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            className="hidden" 
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          
          <Button onClick={() => openModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Products</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 pl-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                        onClick={() => openGallery(product)}
                      >
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase">No Img</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{product.name}</span>
                        {product.images && product.images.length > 1 && (
                          <button 
                            onClick={() => openGallery(product)}
                            className="text-[10px] text-orange-600 font-medium hover:underline text-left"
                          >
                            +{product.images.length - 1} more images
                          </button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>Rs. {product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{getStockBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Gallery" onClick={() => openGallery(product)}>
                        <ImageIcon className="h-4 w-4 text-orange-600" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit Product" onClick={() => openModal(product)}>
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete Product" onClick={() => handleDeleteClick(product.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No products found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="Active">Active</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 group">
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => productImagesInputRef.current?.click()}
                    className="aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Add</span>
                  </button>
                </div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  ref={productImagesInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <p className="text-[10px] text-gray-500">Upload multiple images for a gallery view.</p>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">{editingProduct ? 'Save Changes' : 'Add Product'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4 text-orange-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold text-gray-900">{confirmModal.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
              <Button onClick={confirmModal.onConfirm}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">{alertModal.title}</h3>
            <p className="text-gray-600 mb-6">{alertModal.message}</p>
            <div className="flex justify-end">
              <Button onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}>OK</Button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {galleryModal.isOpen && galleryModal.product && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <button 
            onClick={() => setGalleryModal(prev => ({ ...prev, isOpen: false }))}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="relative w-full max-w-4xl aspect-[4/3] flex items-center justify-center">
            {galleryModal.product.images && galleryModal.product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 backdrop-blur-sm border border-white/10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 backdrop-blur-sm border border-white/10"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            
            <img 
              src={galleryModal.product.images?.[galleryModal.currentIndex]} 
              alt="" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {galleryModal.product.images?.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 w-2 rounded-full transition-all ${i === galleryModal.currentIndex ? 'bg-orange-500 w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-12 text-center text-white">
            <h4 className="text-xl font-bold">{galleryModal.product.name}</h4>
            <p className="text-sm text-gray-400">Image {galleryModal.currentIndex + 1} of {galleryModal.product.images?.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

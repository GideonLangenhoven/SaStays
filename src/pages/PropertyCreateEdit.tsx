// src/pages/PropertyCreateEdit.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';

const AMENITIES = [
  'Wi-Fi', 'Kitchen', 'Air Conditioning', 'Pool', 'Parking', 'TV', 'Washer', 'Dryer', 'Heating', 'Balcony', 'Gym', 'Pet Friendly', 'Wheelchair Accessible', 'Breakfast', 'Workspace', 'Security'
];

const GUEST_REQUIREMENTS = [
  'Government-issued ID',
  'Verified Email',
  'Phone Number',
  'No Smoking',
  'No Parties',
  'No Pets',
];

export default function PropertyCreateEdit() {
  const { id } = useParams(); // If id exists, we're editing
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    capacity: '',
    location: '',
    amenities: [],
    houseRules: '',
    guestRequirements: [],
    status: 'active',
    images: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch property if editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            toast.error('Failed to load property');
            setLoading(false);
            return;
          }
          setForm({
            title: data.name || '',
            description: data.description || '',
            price: data.price_per_night?.toString() || '',
            capacity: data.capacity?.toString() || '',
            location: data.location || '',
            amenities: data.amenities || [],
            houseRules: data.house_rules || '',
            guestRequirements: data.guest_requirements || [],
            status: data.status || 'active',
            images: data.images || [],
          });
          setPreviewImages(data.images || []);
          setLoading(false);
        });
    }
  }, [id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle amenities multi-select
  const handleAmenityToggle = (amenity) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Handle guest requirements multi-select
  const handleGuestRequirementToggle = (req) => {
    setForm((prev) => {
      const exists = prev.guestRequirements.includes(req);
      return {
        ...prev,
        guestRequirements: exists
          ? prev.guestRequirements.filter((r) => r !== req)
          : [...prev.guestRequirements, req],
      };
    });
  };

  // Handle image uploads
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setPreviewImages(files.map((file) => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
      return '';
    }));
    setForm((prev) => ({ ...prev, images: files }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload images to Supabase Storage (if new images selected)
      let imageUrls = [];
      if (form.images.length && form.images[0] instanceof File) {
        for (const file of form.images) {
          const { data, error } = await supabase.storage.from('property-images').upload(`property-${Date.now()}-${file.name}`, file);
          if (error) throw error;
          // Supabase v2: data.path, getPublicUrl returns { data: { publicUrl } }
          const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(data.path);
          const url = publicUrlData?.publicUrl || '';
          imageUrls.push(url);
        }
      } else if (form.images.length) {
        imageUrls = form.images; // Already URLs (edit mode, no new upload)
      }

      const payload = {
        name: form.title,
        description: form.description,
        price_per_night: parseFloat(form.price),
        capacity: parseInt(form.capacity),
        location: form.location,
        amenities: form.amenities,
        house_rules: form.houseRules,
        guest_requirements: form.guestRequirements,
        status: form.status,
        images: imageUrls,
      };

      let result;
      if (id) {
        result = await supabase.from('properties').update(payload).eq('id', id);
      } else {
        result = await supabase.from('properties').insert([payload]);
      }
      if (result.error) throw result.error;
      toast.success(`Property ${id ? 'updated' : 'created'} successfully!`);
      navigate('/owner-dashboard');
    } catch (error) {
      toast.error('Failed to save property.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <Navbar />
      <main className="flex-1 pt-20 container mb-12">
        <h1 className="text-3xl font-bold mb-8">{id ? 'Edit Property' : 'Create New Property'}</h1>
        <form className="space-y-8 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <Input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <Textarea name="description" value={form.description} onChange={handleChange} required rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Price per Night (ZAR)</label>
              <Input name="price" type="number" min="0" value={form.price} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Capacity</label>
              <Input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Map</label>
            <input type="text" className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-400" value="Map picker coming soon" disabled />
            {/* TODO: Integrate interactive map picker in future */}
          </div>
          <div>
            <label className="block font-semibold mb-1">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center gap-1 text-sm">
                  <Checkbox checked={form.amenities.includes(amenity)} onCheckedChange={() => handleAmenityToggle(amenity)} />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">House Rules</label>
            <Textarea name="houseRules" value={form.houseRules} onChange={handleChange} rows={2} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Guest Requirements</label>
            <div className="flex flex-wrap gap-2">
              {GUEST_REQUIREMENTS.map((req) => (
                <label key={req} className="flex items-center gap-1 text-sm">
                  <Checkbox checked={form.guestRequirements.includes(req)} onCheckedChange={() => handleGuestRequirementToggle(req)} />
                  {req}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Status</label>
            <Select value={form.status} onValueChange={(val) => setForm((prev) => ({ ...prev, status: val }))}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Photos & Videos</label>
            <Input type="file" accept="image/*,video/*" multiple ref={fileInputRef} onChange={handleImageChange} />
            <div className="flex gap-2 mt-2 flex-wrap">
              {previewImages.map((src, idx) => (
                <img key={idx} src={src} alt="preview" className="w-24 h-24 object-cover rounded border" />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : id ? 'Update Property' : 'Create Property'}</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
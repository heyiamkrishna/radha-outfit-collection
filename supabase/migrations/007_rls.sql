-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Admin Validation Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PUBLIC POLICIES (Read-only access to active content)
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active product images" ON product_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.is_active = true)
);
CREATE POLICY "Public can view active variants" ON product_variants FOR SELECT USING (is_active = true);

-- CUSTOMER POLICIES (Profiles)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- Prevent role escalation by excluding the role column from updates in the app layer, and checking UUID.
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ADMIN POLICIES (Full control)
CREATE POLICY "Admins have full access to categories" ON categories TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins have full access to products" ON products TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins have full access to product_images" ON product_images TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins have full access to product_variants" ON product_variants TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins have full access to profiles" ON profiles TO authenticated USING (is_admin()) WITH CHECK (is_admin());
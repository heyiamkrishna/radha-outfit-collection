"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Loader2,
  Sparkles,
  Monitor,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialSlides = [
  {
    id: "1",
    title: "FALL / WINTER",
    subtitle: "THE NEW SEASON",
    description:
      "Premium heavyweight streetwear engineered for the modern wardrobe.",
    badge: "NEW COLLECTION",
    buttonText: "SHOP COLLECTION",
    buttonLink: "/shop",
    imageUrl: "",
    mobileImageUrl: "",
    isActive: true,
    sortOrder: 1,
  },
];

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  badge: "",
  buttonText: "SHOP NOW",
  buttonLink: "/shop",
  imageUrl: "",
  mobileImageUrl: "",
  isActive: true,
};

export default function HeroSliderPage() {
  const [slides, setSlides] = useState(initialSlides);
  const [isMounted, setIsMounted] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeSlides = useMemo(
    () => slides.filter((slide) => slide.isActive).length,
    [slides]
  );

  const openCreateModal = () => {
    setEditingSlide(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (slide) => {
    setEditingSlide(slide);

    setFormData({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      badge: slide.badge || "",
      buttonText: slide.buttonText || "SHOP NOW",
      buttonLink: slide.buttonLink || "/shop",
      imageUrl: slide.imageUrl || "",
      mobileImageUrl: slide.mobileImageUrl || "",
      isActive: slide.isActive ?? true,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSlide(null);
    setFormData(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a slide title.");
      return;
    }

    setSaving(true);

    try {
      /*
       * Replace this local logic with your Supabase INSERT/UPDATE
       * once your hero_slides table/API is connected.
       */

      await new Promise((resolve) => setTimeout(resolve, 700));

      if (editingSlide) {
        setSlides((prev) =>
          prev.map((slide) =>
            slide.id === editingSlide.id
              ? {
                  ...slide,
                  ...formData,
                }
              : slide
          )
        );
      } else {
        const newSlide = {
          id: crypto.randomUUID(),
          ...formData,
          sortOrder: slides.length + 1,
        };

        setSlides((prev) => [...prev, newSlide]);
      }

      closeModal();
    } catch (error) {
      console.error(error);
      alert("Unable to save slide.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hero slide?"
    );

    if (!confirmed) return;

    setDeleting(id);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSlides((prev) => {
        const updated = prev
          .filter((slide) => slide.id !== id)
          .map((slide, index) => ({
            ...slide,
            sortOrder: index + 1,
          }));

        return updated;
      });
    } catch (error) {
      console.error(error);
      alert("Unable to delete slide.");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = (id) => {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === id
          ? {
              ...slide,
              isActive: !slide.isActive,
            }
          : slide
      )
    );
  };

  const moveSlide = (index, direction) => {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= slides.length) return;

    setSlides((prev) => {
      const updated = [...prev];

      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];

      return updated.map((slide, index) => ({
        ...slide,
        sortOrder: index + 1,
      }));
    });
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-neutral-950">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                <Sparkles size={15} />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
                Storefront Control
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-syne)] text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Hero Slider
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
              Manage your homepage hero banners, promotional campaigns,
              images and storefront visibility.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-bold text-white shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-neutral-800 active:scale-[0.98] sm:w-auto"
          >
            <Plus
              size={18}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            Add New Slide
          </button>
        </motion.div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mb-8">
          <StatCard
            title="Total Slides"
            value={slides.length}
            icon={ImageIcon}
          />

          <StatCard
            title="Active"
            value={activeSlides}
            icon={Eye}
          />

          <StatCard
            title="Hidden"
            value={slides.length - activeSlides}
            icon={EyeOff}
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* PREVIEW */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-neutral-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold">
                Live Preview
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                Preview how your hero section will appear.
              </p>
            </div>

            <div className="flex w-full rounded-xl bg-neutral-100 p-1 sm:w-auto">
              <PreviewButton
                active={previewMode === "desktop"}
                onClick={() => setPreviewMode("desktop")}
                icon={Monitor}
              >
                Desktop
              </PreviewButton>

              <PreviewButton
                active={previewMode === "mobile"}
                onClick={() => setPreviewMode("mobile")}
                icon={Smartphone}
              >
                Mobile
              </PreviewButton>
            </div>
          </div>

          <div className="flex justify-center bg-neutral-100 p-3 sm:p-6 lg:p-10">
            <div
              className={`overflow-hidden rounded-2xl bg-black shadow-2xl transition-all duration-500 ${
                previewMode === "mobile"
                  ? "w-[280px] sm:w-[320px]"
                  : "w-full"
              }`}
            >
              <HeroPreview
                slide={slides.find((slide) => slide.isActive) || slides[0]}
                mobile={previewMode === "mobile"}
              />
            </div>
          </div>
        </motion.section>

        {/* SLIDES */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold sm:text-2xl">
                Your Slides
              </h2>

              <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                Drag-free ordering controls are provided below.
              </p>
            </div>

            <span className="rounded-full bg-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {slides.length} Slides
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                    height: 0,
                  }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden rounded-[1.5rem] border border-black/[0.06] bg-white shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row">

                    {/* IMAGE */}
                    <div className="relative aspect-[16/8] w-full overflow-hidden bg-neutral-100 lg:aspect-auto lg:h-auto lg:w-[330px] xl:w-[400px]">
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full min-h-[180px] items-center justify-center bg-neutral-200">
                          <div className="text-center">
                            <ImageIcon
                              size={30}
                              className="mx-auto mb-2 text-neutral-400"
                            />

                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                              No Image
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-xs font-black shadow-lg backdrop-blur">
                          {index + 1}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur ${
                            slide.isActive
                              ? "bg-black/80 text-white"
                              : "bg-white/90 text-neutral-500"
                          }`}
                        >
                          {slide.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-6">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <GripVertical
                            size={16}
                            className="text-neutral-300"
                          />

                          {slide.badge && (
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                              {slide.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="font-[family-name:var(--font-syne)] text-xl font-black tracking-tight sm:text-2xl">
                          {slide.title || "Untitled Slide"}
                        </h3>

                        {slide.subtitle && (
                          <p className="mt-1 text-sm font-semibold text-neutral-500">
                            {slide.subtitle}
                          </p>
                        )}

                        {slide.description && (
                          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-neutral-500">
                            {slide.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveSlide(index, -1)}
                            disabled={index === 0}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp size={15} />
                          </button>

                          <button
                            onClick={() => moveSlide(index, 1)}
                            disabled={index === slides.length - 1}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown size={15} />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleActive(slide.id)}
                            className={`flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
                              slide.isActive
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            }`}
                          >
                            {slide.isActive ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}

                            {slide.isActive ? "Active" : "Hidden"}
                          </button>

                          <button
                            onClick={() => openEditModal(slide)}
                            className="flex h-9 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-bold transition hover:bg-neutral-100"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(slide.id)}
                            disabled={deleting === slide.id}
                            className="flex h-9 items-center gap-2 rounded-xl bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            {deleting === slide.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={14} />
                            )}

                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {slides.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-10 text-center sm:p-16">
                <ImageIcon
                  size={40}
                  className="mx-auto mb-4 text-neutral-300"
                />

                <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold">
                  No hero slides
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
                  Create your first homepage hero banner.
                </p>

                <button
                  onClick={openCreateModal}
                  className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
                >
                  Create Slide
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
              }}
              className="max-h-[95dvh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-3xl sm:rounded-[2rem]"
            >
              {/* MODAL HEADER */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/90 p-5 backdrop-blur-xl sm:p-6">
                <div>
                  <h2 className="font-[family-name:var(--font-syne)] text-xl font-black sm:text-2xl">
                    {editingSlide ? "Edit Hero Slide" : "Create Hero Slide"}
                  </h2>

                  <p className="mt-1 text-xs text-neutral-400">
                    Configure your storefront banner.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-neutral-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSave}
                className="space-y-6 p-5 sm:p-7"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Badge"
                    name="badge"
                    value={formData.badge}
                    onChange={handleChange}
                    placeholder="NEW COLLECTION"
                  />

                  <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="FALL / WINTER"
                    required
                  />

                  <Input
                    label="Subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="THE NEW SEASON"
                  />

                  <Input
                    label="Button Text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleChange}
                    placeholder="SHOP NOW"
                  />

                  <Input
                    label="Button Link"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleChange}
                    placeholder="/shop"
                  />
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your collection..."
                    className="w-full resize-none rounded-2xl border-2 border-neutral-100 bg-neutral-50 p-4 text-sm font-medium outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div className="space-y-5">
                  <ImageInput
                    label="Desktop Image URL"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                  <ImageInput
                    label="Mobile Image URL"
                    name="mobileImageUrl"
                    value={formData.mobileImageUrl}
                    onChange={handleChange}
                    placeholder="Optional mobile image"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div>
                    <p className="text-sm font-bold">
                      Publish Slide
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Make this slide visible on the storefront.
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="peer sr-only"
                    />

                    <div className="h-7 w-12 rounded-full bg-neutral-300 transition peer-checked:bg-black" />

                    <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  </div>
                </label>

                {/* ACTIONS */}
                <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-12 rounded-xl border border-neutral-200 px-6 text-sm font-bold transition hover:bg-neutral-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-7 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {editingSlide ? "Update Slide" : "Create Slide"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  className = "",
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            {title}
          </p>

          <p className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-black sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   PREVIEW BUTTON
========================================================= */

function PreviewButton({
  children,
  active,
  onClick,
  icon: Icon,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none ${
        active
          ? "bg-white text-black shadow-sm"
          : "text-neutral-500 hover:text-black"
      }`}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}

/* =========================================================
   HERO PREVIEW
========================================================= */

function HeroPreview({ slide, mobile }) {
  if (!slide) {
    return (
      <div className="flex aspect-[16/8] items-center justify-center bg-neutral-900 text-white">
        No active slide
      </div>
    );
  }

  const backgroundImage = mobile
    ? slide.mobileImageUrl || slide.imageUrl
    : slide.imageUrl;

  return (
    <div
      className={`relative isolate overflow-hidden ${
        mobile ? "aspect-[9/14]" : "aspect-[16/7]"
      }`}
    >
      {backgroundImage ? (
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
          src={backgroundImage}
          alt={slide.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}

      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

      <div
        className={`relative z-10 flex h-full flex-col justify-center text-white ${
          mobile ? "px-5" : "px-6 sm:px-10"
        }`}
      >
        {slide.badge && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] backdrop-blur"
          >
            {slide.badge}
          </motion.span>
        )}

        {slide.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-white/70"
          >
            {slide.subtitle}
          </motion.p>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`font-[family-name:var(--font-syne)] font-black leading-[0.9] tracking-[-0.05em] ${
            mobile
              ? "max-w-[240px] text-4xl"
              : "max-w-2xl text-4xl sm:text-6xl"
          }`}
        >
          {slide.title}
        </motion.h2>

        {slide.description && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`mt-4 text-xs leading-5 text-white/70 ${
              mobile ? "max-w-[220px]" : "max-w-lg"
            }`}
          >
            {slide.description}
          </motion.p>
        )}

        {slide.buttonText && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5"
          >
            <span className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-black">
              {slide.buttonText}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 text-sm font-medium text-black outline-none transition focus:border-black focus:bg-white"
      />
    </div>
  );
}

/* =========================================================
   IMAGE INPUT
========================================================= */

function ImageInput({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        {label}
      </label>

      <div className="flex overflow-hidden rounded-xl border-2 border-neutral-100 bg-neutral-50 transition focus-within:border-black focus-within:bg-white">
        <div className="flex w-11 shrink-0 items-center justify-center border-r border-neutral-100">
          <ImageIcon size={16} className="text-neutral-400" />
        </div>

        <input
          type="url"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm font-medium outline-none"
        />
      </div>

      {value && (
        <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
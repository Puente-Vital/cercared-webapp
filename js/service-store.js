import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKV8X6ZDw12oFHyKYSNsnX_HiGRWlbaAQ",
  authDomain: "cercared-auth.firebaseapp.com",
  projectId: "cercared-auth",
  storageBucket: "cercared-auth.firebasestorage.app",
  messagingSenderId: "303320791334",
  appId: "1:303320791334:web:4b32a407f6cb0748ae69e7"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const SERVICES_COLLECTION = "services";
const MAX_CUSTOM_SECTIONS = 3;
const MAX_CUSTOM_ITEMS = 8;
const MAX_SELECT_OPTIONS = 6;

function slugifySectionId(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "seccion";
}

function normalizeCustomSections(customSections = []) {
  if (!Array.isArray(customSections)) return [];

  return customSections
    .map((section, index) => {
      const title = String(section?.title || "").trim();
      const kind = ["text", "items", "resources", "select"].includes(section?.kind)
        ? section.kind
        : "text";
      const id = slugifySectionId(section?.id || title || `seccion-${index + 1}`);
      const baseSection = {
        id,
        title: title || `Sección ${index + 1}`,
        kind,
        showInSimple: section?.showInSimple !== false,
      };

      if (kind === "text") {
        return {
          ...baseSection,
          content: String(section?.content || "").trim(),
        };
      }

      if (kind === "select") {
        const options = Array.isArray(section?.options)
          ? section.options.map((option) => String(option || "").trim()).filter(Boolean).slice(0, MAX_SELECT_OPTIONS)
          : [];
        const value = String(section?.value || options[0] || "").trim();
        return {
          ...baseSection,
          options,
          value,
        };
      }

      const items = Array.isArray(section?.items)
        ? section.items
          .map((item) => ({
            title: String(item?.title || "").trim(),
            description: String(item?.description || "").trim(),
            ...(kind === "resources"
              ? {
                  url: String(item?.url || "").trim(),
                  type: String(item?.type || "otro").trim() || "otro",
                }
              : {}),
          }))
          .filter((item) => item.title && (kind === "resources" ? item.url : item.description))
          .slice(0, MAX_CUSTOM_ITEMS)
        : [];

      return {
        ...baseSection,
        items,
      };
    })
    .filter((section) => {
      if (section.kind === "text") return Boolean(section.content);
      if (section.kind === "select") return section.options.length > 0;
      return section.items.length > 0;
    })
    .slice(0, MAX_CUSTOM_SECTIONS);
}

function getBaseServices() {
  return window.CercaRedServices || [];
}

function normalizeService(service) {
  return {
    ...service,
    active: service.active !== false,
    keywords: service.keywords || [],
    requirements: service.requirements || [],
    documents: service.documents || [],
    steps: service.steps || [],
    procedures: service.procedures || [
      {
        value: "procedimiento-general",
        label: "Procedimiento general",
      },
    ],
    channels: service.channels || [],
    resources: service.resources || [],
    checklist: service.checklist || [],
    customSections: normalizeCustomSections(service.customSections),
  };
}

function mergeServices(baseServices, firestoreServices) {
  const serviceMap = new Map();

  baseServices.forEach((service) => {
    serviceMap.set(service.id, normalizeService(service));
  });

  firestoreServices.forEach((service) => {
    const currentService = serviceMap.get(service.id) || {};
    serviceMap.set(service.id, normalizeService({ ...currentService, ...service }));
  });

  return Array.from(serviceMap.values());
}

export async function loadServices() {
  const baseServices = getBaseServices();

  try {
    const snapshot = await getDocs(collection(db, SERVICES_COLLECTION));
    const firestoreServices = snapshot.docs.map((serviceDoc) => ({
      id: serviceDoc.id,
      ...serviceDoc.data(),
    }));

    return mergeServices(baseServices, firestoreServices);
  } catch (error) {
    console.warn("No se pudieron cargar servicios desde Firestore:", error);
    return baseServices.map(normalizeService);
  }
}

export async function saveService(service) {
  const serviceId = service.id;
  await setDoc(
    doc(db, SERVICES_COLLECTION, serviceId),
    {
      ...service,
      id: serviceId,
      active: service.active !== false,
      updatedAt: serverTimestamp(),
      createdAt: service.createdAt || serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateService(serviceId, data) {
  await setDoc(
    doc(db, SERVICES_COLLECTION, serviceId),
    {
      ...data,
      id: serviceId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setServiceActive(serviceId, active) {
  await updateService(serviceId, { active });
}

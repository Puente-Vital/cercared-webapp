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

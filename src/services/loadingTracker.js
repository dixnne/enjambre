class LoadingTracker {
  constructor() {
    this.dependencies = {
      firebase: false,
      auth: false,
      firestore: false,
      location: false,
      map: false
    };
    this.listeners = [];
  }

  markLoaded(dep) {
    this.dependencies[dep] = true;
    this.notifyListeners();
  }

  getProgress() {
    const loaded = Object.values(this.dependencies).filter(Boolean).length;
    const total = Object.keys(this.dependencies).length;
    return Math.round((loaded / total) * 100);
  }

  getStatus() {
    if (!this.dependencies.firebase) return 'Cargando Firebase...';
    if (!this.dependencies.auth) return 'Autenticando...';
    if (!this.dependencies.firestore) return 'Conectando a la base de datos...';
    if (!this.dependencies.location) return 'Obteniendo ubicación...';
    if (!this.dependencies.map) return 'Cargando mapa...';
    return 'Listo!';
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => {
      listener({
        progress: this.getProgress(),
        status: this.getStatus(),
        dependencies: { ...this.dependencies }
      });
    });
  }

  reset() {
    Object.keys(this.dependencies).forEach(key => {
      this.dependencies[key] = false;
    });
    this.notifyListeners();
  }
}

export const loadingTracker = new LoadingTracker();

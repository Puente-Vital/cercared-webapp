(function () {
  function getFallbackImageCandidates(serviceId) {
    const safeId = String(serviceId || "").trim();
    if (!safeId) {
      return ["assets/images/cards/default.svg"];
    }

    return [
      `assets/images/cards/${safeId}.jpg`,
      `assets/images/cards/${safeId}.png`,
      `assets/images/cards/${safeId}.webp`,
      `assets/images/cards/${safeId}.svg`,
      "assets/images/cards/default.svg",
    ];
  }

  function getServiceImageCandidates(service) {
    const customImage = typeof service?.image === "string" ? service.image.trim() : "";
    return customImage
      ? [customImage, ...getFallbackImageCandidates(service?.id)]
      : getFallbackImageCandidates(service?.id);
  }

  function getServiceImage(service) {
    return getServiceImageCandidates(service)[0];
  }

  function attachFallback(img, candidates) {
    if (!img || !Array.isArray(candidates) || candidates.length === 0) return;

    let index = 0;
    img.src = candidates[index];
    img.onerror = () => {
      index += 1;
      if (index >= candidates.length) {
        img.onerror = null;
        return;
      }
      img.src = candidates[index];
    };
  }

  window.CercaRedServiceImages = {
    getFallbackImageCandidates,
    getServiceImageCandidates,
    getServiceImage,
    attachFallback,
  };
})();

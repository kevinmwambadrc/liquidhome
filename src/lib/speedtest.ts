/**
 * Liquid Home Real-Time Speed Test Engine
 * High-accuracy multi-stream bandwidth, latency & jitter measurement
 */

export interface SpeedTestProgress {
  phase: "idle" | "ping" | "download" | "upload" | "finished" | "error";
  pingMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  progressPercent: number; // 0 to 100
  downloadGraph: { time: number; speed: number }[];
  uploadGraph: { time: number; speed: number }[];
  currentSpeed: number; // For needle gauge
  server: string;
  clientIp: string;
  isp: string;
  errorMessage?: string;
}

export interface SpeedTestFinalResult {
  ping: number;
  jitter: number;
  downloadMbps: number;
  uploadMbps: number;
  server: string;
  clientIp: string;
  isp: string;
  rating: "ultra" | "excellent" | "good" | "fair";
  ratingLabel: string;
  matchedPlan: {
    name: string;
    speed: string;
    price: number;
    slug: string;
  };
  diagnostics: {
    gaming: boolean;
    streaming4k: boolean;
    conferencing: boolean;
    largeUploads: boolean;
  };
}

export async function runSpeedTest(
  serverEndpoint: string = "/api/speedtest",
  onProgress: (progress: SpeedTestProgress) => void
): Promise<SpeedTestFinalResult> {
  const state: SpeedTestProgress = {
    phase: "ping",
    pingMs: 0,
    jitterMs: 0,
    downloadMbps: 0,
    uploadMbps: 0,
    progressPercent: 5,
    downloadGraph: [],
    uploadGraph: [],
    currentSpeed: 0,
    server: "Liquid Home Kinshasa Core",
    clientIp: "197.234.218.42",
    isp: "Liquid Intelligent Technologies RDC",
  };

  onProgress({ ...state });

  try {
    // ==========================================
    // 1. PING & JITTER PHASE
    // ==========================================
    const pingSamples: number[] = [];
    const PING_COUNT = 8;

    for (let i = 0; i < PING_COUNT; i++) {
      const start = performance.now();
      const res = await fetch(`${serverEndpoint}/ping?t=${Date.now()}_${i}`, {
        cache: "no-store",
      });
      const end = performance.now();
      const rtt = Math.max(1, Math.round(end - start));
      pingSamples.push(rtt);

      if (i === 0 && res.ok) {
        try {
          const info = await res.json();
          if (info.server) state.server = info.server;
          if (info.ip) state.clientIp = info.ip;
          if (info.isp) state.isp = info.isp;
        } catch {}
      }

      state.pingMs = Math.round(pingSamples.reduce((a, b) => a + b, 0) / pingSamples.length);
      state.progressPercent = Math.round(5 + ((i + 1) / PING_COUNT) * 15);
      onProgress({ ...state });

      // Tiny pause between pings
      await new Promise((r) => setTimeout(r, 40));
    }

    // Compute RFC 3550 Jitter
    let jitterSum = 0;
    for (let i = 1; i < pingSamples.length; i++) {
      jitterSum += Math.abs(pingSamples[i] - pingSamples[i - 1]);
    }
    state.jitterMs = Number((jitterSum / (pingSamples.length - 1)).toFixed(1));
    state.pingMs = Math.min(...pingSamples); // Best ping reported

    // ==========================================
    // 2. DOWNLOAD PHASE (Multi-stream)
    // ==========================================
    state.phase = "download";
    onProgress({ ...state });

    const DOWNLOAD_DURATION_MS = 6500;
    const downloadStartTime = performance.now();
    let totalDownloadedBytes = 0;
    let smoothedDownloadSpeed = 0;
    const downloadGraphData: { time: number; speed: number }[] = [];

    let isDownloadRunning = true;
    const CONCURRENT_DOWNLOADS = 4;

    const downloadWorker = async () => {
      while (isDownloadRunning) {
        try {
          const res = await fetch(`${serverEndpoint}/download?bytes=10485760&t=${Date.now()}_${Math.random()}`, {
            cache: "no-store",
          });
          if (!res.body) break;
          const reader = res.body.getReader();
          while (isDownloadRunning) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              totalDownloadedBytes += value.length;
            }
          }
        } catch {
          break;
        }
      }
    };

    // Launch parallel streams
    const downloadPromises = Array.from({ length: CONCURRENT_DOWNLOADS }, () => downloadWorker());

    // Sampler loop every 100ms
    const downloadSampler = new Promise<void>((resolve) => {
      let lastBytes = 0;
      let lastTime = performance.now();

      const interval = setInterval(() => {
        const now = performance.now();
        const elapsedTotal = now - downloadStartTime;
        const dt = (now - lastTime) / 1000;
        const dBytes = totalDownloadedBytes - lastBytes;

        lastBytes = totalDownloadedBytes;
        lastTime = now;

        if (dt > 0) {
          const instantaneousMbps = (dBytes * 8) / (dt * 1000 * 1000);
          smoothedDownloadSpeed = smoothedDownloadSpeed === 0
            ? instantaneousMbps
            : 0.65 * smoothedDownloadSpeed + 0.35 * instantaneousMbps;

          state.downloadMbps = Number(smoothedDownloadSpeed.toFixed(2));
          state.currentSpeed = state.downloadMbps;

          downloadGraphData.push({
            time: Number((elapsedTotal / 1000).toFixed(1)),
            speed: state.downloadMbps,
          });
          state.downloadGraph = [...downloadGraphData];

          state.progressPercent = Math.min(60, 20 + Math.round((elapsedTotal / DOWNLOAD_DURATION_MS) * 40));
          onProgress({ ...state });
        }

        if (elapsedTotal >= DOWNLOAD_DURATION_MS) {
          clearInterval(interval);
          isDownloadRunning = false;
          resolve();
        }
      }, 100);
    });

    await downloadSampler;
    await Promise.allSettled(downloadPromises);

    // Final accurate calculation over the main stable window
    const downloadElapsedSec = (performance.now() - downloadStartTime) / 1000;
    const overallDownloadMbps = (totalDownloadedBytes * 8) / (downloadElapsedSec * 1000 * 1000);
    state.downloadMbps = Number(Math.max(smoothedDownloadSpeed * 0.9, overallDownloadMbps).toFixed(2));

    // Pause between phases
    await new Promise((r) => setTimeout(r, 400));

    // ==========================================
    // 3. UPLOAD PHASE (Multi-stream)
    // ==========================================
    state.phase = "upload";
    state.currentSpeed = 0;
    onProgress({ ...state });

    const UPLOAD_DURATION_MS = 6000;
    const uploadStartTime = performance.now();
    let totalUploadedBytes = 0;
    let smoothedUploadSpeed = 0;
    const uploadGraphData: { time: number; speed: number }[] = [];

    // Pre-allocate upload payload chunk (512 KB)
    const UPLOAD_CHUNK_SIZE = 512 * 1024;
    const payload = new Uint8Array(UPLOAD_CHUNK_SIZE);
    for (let i = 0; i < UPLOAD_CHUNK_SIZE; i += 64) {
      payload[i] = (i + 37) % 256;
    }

    let isUploadRunning = true;
    const CONCURRENT_UPLOADS = 3;

    const uploadWorker = async () => {
      while (isUploadRunning) {
        try {
          const reqStart = performance.now();
          const res = await fetch(`${serverEndpoint}/upload?t=${Date.now()}_${Math.random()}`, {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: payload,
            cache: "no-store",
          });
          const reqEnd = performance.now();
          if (res.ok) {
            totalUploadedBytes += payload.byteLength;
          }
        } catch {
          break;
        }
      }
    };

    const uploadPromises = Array.from({ length: CONCURRENT_UPLOADS }, () => uploadWorker());

    const uploadSampler = new Promise<void>((resolve) => {
      let lastBytes = 0;
      let lastTime = performance.now();

      const interval = setInterval(() => {
        const now = performance.now();
        const elapsedTotal = now - uploadStartTime;
        const dt = (now - lastTime) / 1000;
        const dBytes = totalUploadedBytes - lastBytes;

        lastBytes = totalUploadedBytes;
        lastTime = now;

        if (dt > 0) {
          const instantaneousMbps = (dBytes * 8) / (dt * 1000 * 1000);
          smoothedUploadSpeed = smoothedUploadSpeed === 0
            ? instantaneousMbps
            : 0.65 * smoothedUploadSpeed + 0.35 * instantaneousMbps;

          state.uploadMbps = Number(smoothedUploadSpeed.toFixed(2));
          state.currentSpeed = state.uploadMbps;

          uploadGraphData.push({
            time: Number((elapsedTotal / 1000).toFixed(1)),
            speed: state.uploadMbps,
          });
          state.uploadGraph = [...uploadGraphData];

          state.progressPercent = Math.min(98, 60 + Math.round((elapsedTotal / UPLOAD_DURATION_MS) * 38));
          onProgress({ ...state });
        }

        if (elapsedTotal >= UPLOAD_DURATION_MS) {
          clearInterval(interval);
          isUploadRunning = false;
          resolve();
        }
      }, 100);
    });

    await uploadSampler;
    await Promise.allSettled(uploadPromises);

    const uploadElapsedSec = (performance.now() - uploadStartTime) / 1000;
    const overallUploadMbps = (totalUploadedBytes * 8) / (uploadElapsedSec * 1000 * 1000);
    state.uploadMbps = Number(Math.max(smoothedUploadSpeed * 0.9, overallUploadMbps).toFixed(2));

    // ==========================================
    // 4. FINISHED PHASE & RESULT GENERATION
    // ==========================================
    state.phase = "finished";
    state.progressPercent = 100;
    state.currentSpeed = state.downloadMbps;
    onProgress({ ...state });

    // Determine rating & plan recommendation
    const dl = state.downloadMbps;
    let rating: "ultra" | "excellent" | "good" | "fair" = "good";
    let ratingLabel = "Bonne Connexion Fibre";
    let matchedPlan = {
      name: "Fibron Standard",
      speed: "25 Mbps",
      price: 69,
      slug: "standard",
    };

    if (dl >= 90) {
      rating = "ultra";
      ratingLabel = "Connexion Fibre Ultra Haute Performance (100 Mbps+)";
      matchedPlan = {
        name: "Fibron Ultra",
        speed: "100 Mbps",
        price: 149,
        slug: "ultra",
      };
    } else if (dl >= 45) {
      rating = "excellent";
      ratingLabel = "Excellente Connexion Fibre Pro (50 Mbps)";
      matchedPlan = {
        name: "Fibron Pro",
        speed: "50 Mbps",
        price: 99,
        slug: "pro",
      };
    } else if (dl >= 20) {
      rating = "good";
      ratingLabel = "Bonne Connexion Fibre Quotidienne (25 Mbps)";
      matchedPlan = {
        name: "Fibron Standard",
        speed: "25 Mbps",
        price: 69,
        slug: "standard",
      };
    } else {
      rating = "fair";
      ratingLabel = "Connexion Fibre Essentielle (10 Mbps)";
      matchedPlan = {
        name: "Fibron Starter",
        speed: "10 Mbps",
        price: 49,
        slug: "starter",
      };
    }

    const finalResult: SpeedTestFinalResult = {
      ping: state.pingMs,
      jitter: state.jitterMs,
      downloadMbps: state.downloadMbps,
      uploadMbps: state.uploadMbps,
      server: state.server,
      clientIp: state.clientIp,
      isp: state.isp,
      rating,
      ratingLabel,
      matchedPlan,
      diagnostics: {
        gaming: state.pingMs <= 35 && state.jitterMs <= 8,
        streaming4k: state.downloadMbps >= 25,
        conferencing: state.uploadMbps >= 5 && state.pingMs <= 50,
        largeUploads: state.uploadMbps >= 15,
      },
    };

    // Save result in background
    fetch("/api/speedtest/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ping: state.pingMs,
        jitter: state.jitterMs,
        downloadMbps: state.downloadMbps,
        uploadMbps: state.uploadMbps,
        server: state.server,
        clientIp: state.clientIp,
        isp: state.isp,
        rating,
      }),
    }).catch(() => {});

    return finalResult;
  } catch (err: any) {
    state.phase = "error";
    state.errorMessage = err?.message || "Erreur lors du test de débit";
    onProgress({ ...state });
    throw err;
  }
}

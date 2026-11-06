import { Form } from "react-router";
import type { Route } from "./+types/home";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createUser } from "~/model/database";

/*
  WHERE THINGS RUN

  SERVER only:   action()  (checks the form and would save the user)
  BOTH:          the top of Home() and the other components (React renders them
                 on the server first, then again in the browser)
  BROWSER only:  useEffect() and click handlers (this is the only place
                 navigator, window and the device APIs exist)
*/

export function meta({}: Route.MetaArgs) {
  return [
    { title: "React Native learning journey" },
    { name: "description", content: "Create your account to start learning." },
  ];
}

// ---------- Shared data and styles ----------



// ---------- SERVER: form action ----------

type ActionResult = {
  errors: Record<string, string>;
  success?: boolean;
  name?: string;
};

export async function action({ request }: Route.ActionArgs): Promise<ActionResult> {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const course = String(formData.get("course") ?? "");
  const password = String(formData.get("password") ?? "");

  // Always check again on the server. Browser checks can be bypassed
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!department) errors.department = "Enter your department.";
  if (!COURSES.some((item) => item.value === course)) errors.course = "Select your course.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";

  if (Object.keys(errors).length > 0) return { errors };

  try {
    const result = await createUser({ name, email, department, course, password });
    if (!result.ok) return { errors: { email: "This email is already registered." } };
    return { errors: {}, success: true, name };
  } catch (error) {
    console.error("Could not save user:", error);
    // return { errors: {}, formError: "Could not create your account. Please try again." };
  }
}



// ---------- Page ----------

export default function Home({ actionData }: Route.ComponentProps) {
  const [showPassword, setShowPassword] = useState(false);
  const errors = actionData?.errors ?? {};

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 md:pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome to your React Native learning journey
        </h1>
        <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
          Create your account to start learning and track your progress.
        </p>
      </header>

      <div className="grid items-start gap-8 md:grid-cols-2">
        {/* Image: hidden on very small screens to keep the form first */}
        <img
          src="learning.jpg"
          alt="A learner building a mobile app on a laptop"
          loading="lazy"
          className="hidden h-full max-h-96 w-full rounded-2xl object-cover sm:block"
        />

        <Form
          method="post"
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Create your account
          </h2>

          {actionData?.success && (
            <p
              role="status"
              className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            >
              Account created for {actionData.name}.
            </p>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Wanjiku"
              required
              className={fieldClass}
            />
            <FieldError message={errors.name} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className={fieldClass}
            />
            <FieldError message={errors.email} />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className={labelClass}>
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              placeholder="e.g. School of Computing"
              required
              className={fieldClass}
            />
            <FieldError message={errors.department} />
          </div>

          {/* Course */}
          <div>
            <label htmlFor="course" className={labelClass}>
              Course
            </label>
            <select id="course" name="course" required defaultValue="" className={fieldClass}>
              <option value="" disabled>
                Select your course
              </option>
              {COURSES.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.course} />
          </div>

          {/* Password with show/hide button */}
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
                aria-describedby="password-hint"
                className={`${fieldClass} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 dark:text-indigo-300 dark:hover:bg-slate-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p id="password-hint" className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Use at least 8 characters.
            </p>
            <FieldError message={errors.password} />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            Create account
          </button>
        </Form>
      </div>

      {/* Device features: every card runs only in the browser */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Device features
        </h2>
        <p className="mb-6 mt-2 max-w-xl text-slate-600 dark:text-slate-400">
          Try each browser feature. Your browser asks for permission when you tap a button.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <CameraCard />
          <TwoPersonCall />
          <LocationCard />
          <ContactsCard />
          <OtpCard />
          <BluetoothCard />
          <FilesCard />

        </div>
      </section>
    </main>
  );
}
// ---------- BROWSER: helpers ----------

// Turn browser errors into short messages
function errorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") return "Permission denied.";
    if (error.name === "NotFoundError") return "No device found, or you cancelled.";
    if (error.name === "AbortError") return "Cancelled.";
    if (error.name === "NotSupportedError") return "Not supported here.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

// Track a permission and update when the user changes it
function usePermission(name: string) {
  const [state, setState] = useState("checking");

  useEffect(() => {
    if (!navigator.permissions) {
      setState("unknown");
      return;
    }

    let status: PermissionStatus | undefined;
    let active = true;
    const update = () => {
      if (active && status) setState(status.state);
    };

    navigator.permissions
      .query({ name: name as PermissionName })
      .then((result) => {
        status = result;
        update();
        result.addEventListener("change", update);
      })
      .catch(() => {
        if (active) setState("unknown");
      });

    return () => {
      active = false;
      status?.removeEventListener("change", update);
    };
  }, [name]);

  return state;
}

// ---------- BROWSER: small UI pieces ----------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

function PermissionBadge({ label, state }: { label: string; state: string }) {
  const colors: Record<string, string> = {
    granted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    denied: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    prompt: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  };
  const color = colors[state] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}: {state}
    </span>
  );
}

function Card({
  title,
  status,
  badges,
  children,
}: {
  title: string;
  status: string;
  badges?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
      {children}
      <p aria-live="polite" className="text-sm text-slate-600 dark:text-slate-400">
        {status}
      </p>
    </section>
  );
}

// ---------- BROWSER: device cards ----------

// Camera and microphone
function CameraCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState("Camera is off.");
  const [withMic, setWithMic] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const cameraPermission = usePermission("camera");
  const micPermission = usePermission("microphone");

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsOn(false);
    setStatus("Camera is off.");
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Camera not available. Use HTTPS and a supported browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // back camera
        audio: withMic,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsOn(true);
      setStatus(withMic ? "Camera and microphone are on." : "Camera is on.");
    } catch (error) {
      // NotAllowedError = denied, NotFoundError = no camera
      setStatus(errorMessage(error));
    }
  }

  // Turn the camera off when leaving the page
  useEffect(() => {
    return () => {
      if (STOP_CAMERA_WHEN_LEAVING) {
        streamRef.current?.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <Card
      title="Camera and microphone"
      status={status}
      badges={
        <>
          <PermissionBadge label="Camera" state={cameraPermission} />
          <PermissionBadge label="Mic" state={micPermission} />
        </>
      }
    >
      {/* muted stops echo from your own microphone */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="aspect-video w-full rounded-lg bg-slate-900"
      />
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={withMic}
          disabled={isOn}
          onChange={(event) => setWithMic(event.target.checked)}
        />
        Include microphone
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={startCamera} disabled={isOn} className={primaryButton}>
          Start
        </button>
        <button type="button" onClick={stopCamera} disabled={!isOn} className={secondaryButton}>
          Stop
        </button>
      </div>
    </Card>
  );
}

// Location
function LocationCard() {
  const watchId = useRef<number | null>(null);
  const [status, setStatus] = useState("Location not requested.");
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [watching, setWatching] = useState(false);
  const permission = usePermission("geolocation");

  const errorTexts: Record<number, string> = {
    1: "Permission denied.",
    2: "Location unavailable.",
    3: "Timed out. Try again.",
  };

  function onSuccess(pos: GeolocationPosition) {
    setCoords({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });
    setStatus("Location received.");
  }

  function onError(err: GeolocationPositionError) {
    setStatus(errorTexts[err.code] ?? "Could not get location.");
  }

  const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 };

  function getOnce() {
    if (!("geolocation" in navigator)) {
      setStatus("Location is not supported on this browser.");
      return;
    }
    setStatus("Getting location...");
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }

  function startWatching() {
    if (!("geolocation" in navigator)) return;
    watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
    setWatching(true);
    setStatus("Watching your location...");
  }

  function stopWatching() {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setWatching(false);
    setStatus("Stopped watching.");
  }

  // Stop watching when leaving the page
  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return (
    <Card
      title="Location"
      status={status}
      badges={<PermissionBadge label="Location" state={permission} />}
    >
      {coords && (
        <p className="text-sm text-slate-800 dark:text-slate-200">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} (within {Math.round(coords.accuracy)} m)
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={getOnce} className={primaryButton}>
          Get location
        </button>
        {watching ? (
          <button type="button" onClick={stopWatching} className={secondaryButton}>
            Stop watching
          </button>
        ) : (
          <button type="button" onClick={startWatching} className={secondaryButton}>
            Watch live
          </button>
        )}
      </div>
    </Card>
  );
}

// Contacts
type PickedContact = { name?: string[]; tel?: string[] };

function ContactsCard() {
  const [status, setStatus] = useState("No contacts picked yet.");
  const [contacts, setContacts] = useState<PickedContact[]>([]);

  async function pickContacts() {
    // Only Chrome on Android supports this
    if (!("contacts" in navigator)) {
      setStatus("Contact picker is not supported here. Type the number instead.");
      return;
    }
    try {
      const picked = await (navigator as any).contacts.select(["name", "tel"], {
        multiple: true,
      });
      setContacts(picked);
      setStatus(picked.length ? `${picked.length} contact(s) picked.` : "Nothing picked.");
    } catch (error) {
      setStatus(errorMessage(error));
    }
  }

  return (
    <Card title="Contacts" status={status}>
      <ul className="space-y-1 text-sm text-slate-800 dark:text-slate-200">
        {contacts.map((contact, index) => (
          <li key={index}>
            {contact.name?.[0] ?? "No name"} {contact.tel?.[0] ? `- ${contact.tel[0]}` : ""}
          </li>
        ))}
      </ul>
      <button type="button" onClick={pickContacts} className={primaryButton}>
        Pick contacts
      </button>
    </Card>
  );
}

// SMS verification code (Web OTP)
function OtpCard() {
  const [status, setStatus] = useState("Starting...");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!("OTPCredential" in window)) {
      setStatus("Web OTP is not supported on this browser.");
      return;
    }

    const controller = new AbortController();
    setStatus("Waiting for an SMS code...");

    (navigator.credentials as any)
      .get({ otp: { transport: ["sms"] }, signal: controller.signal })
      .then((otp: { code: string } | null) => {
        if (otp) {
          setCode(otp.code);
          setStatus("Code received.");
        }
      })
      .catch(() => {
        // Ignore the abort that happens when leaving the page
        if (!controller.signal.aborted) setStatus("Stopped listening for SMS.");
      });

    return () => controller.abort();
  }, []);

  return (
    <Card title="SMS verification code" status={status}>
      <input
        type="text"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        autoComplete="one-time-code"
        inputMode="numeric"
        placeholder="123456"
        aria-label="Verification code"
        className={fieldClass}
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The SMS must end with a line like @yourdomain.com #123456.
      </p>
    </Card>
  );
}

// Bluetooth (nearby devices)
function BluetoothCard() {
  const deviceRef = useRef<any>(null);
  const [status, setStatus] = useState("Not connected.");
  const [battery, setBattery] = useState<number | null>(null);

  // Must run inside a click handler
  async function connect() {
    if (!("bluetooth" in navigator)) {
      setStatus("Bluetooth is not supported on this browser.");
      return;
    }
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ["battery_service"] }],
      });
      deviceRef.current = device;

      // Runs when the device goes out of range or turns off
      device.addEventListener("gattserverdisconnected", () => {
        setStatus("Disconnected.");
        setBattery(null);
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("battery_service");
      const characteristic = await service.getCharacteristic("battery_level");
      const value = await characteristic.readValue();

      setBattery(value.getUint8(0));
      setStatus(`Connected to ${device.name ?? "device"}.`);
    } catch (error) {
      setStatus(errorMessage(error));
    }
  }

  function disconnect() {
    deviceRef.current?.gatt?.disconnect();
  }

  // Disconnect when leaving the page
  useEffect(() => {
    return () => deviceRef.current?.gatt?.disconnect();
  }, []);

  return (
    <Card title="Nearby devices (Bluetooth)" status={status}>
      {battery !== null && (
        <p className="text-sm text-slate-800 dark:text-slate-200">Battery: {battery}%</p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={connect} className={primaryButton}>
          Connect
        </button>
        <button type="button" onClick={disconnect} className={secondaryButton}>
          Disconnect
        </button>
      </div>
    </Card>
  );
}

// Files
function FilesCard() {
  const urlRef = useRef<string | null>(null);
  const [status, setStatus] = useState("No file selected.");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function showFile(file: File) {
    // Free the old preview before making a new one
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setPreviewUrl(urlRef.current);
    setStatus(`${file.name} (${Math.round(file.size / 1024)} KB)`);
  }

  // Chromium desktop only
  async function openWithPicker() {
    if (!("showOpenFilePicker" in window)) {
      setStatus("Not supported here. Use the file input instead.");
      return;
    }
    try {
      const [handle] = await (window as any).showOpenFilePicker();
      showFile(await handle.getFile());
    } catch (error) {
      setStatus(errorMessage(error));
    }
  }

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return (
    <Card title="Files" status={status}>
      {previewUrl && (
        <img src={previewUrl} alt="Selected file preview" className="max-h-48 rounded-lg" />
      )}
      {/* Works everywhere. "capture" opens the camera on phones */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        aria-label="Choose or take a photo"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) showFile(file);
        }}
        className="block w-full text-sm text-slate-700 dark:text-slate-300"
      />
      <button type="button" onClick={openWithPicker} className={secondaryButton}>
        Open file picker (desktop Chrome)
      </button>
    </Card>
  );
}
const COURSES = [
  { value: "computer-science", label: "Computer science" },
  { value: "data-science", label: "Data science" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "maths-and-computing", label: "Maths and computing" },
  { value: "engineering", label: "Engineering" },
  { value: "data-economics", label: "Data economics" },
];

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 " +
  "placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 " +
  "focus:ring-indigo-600/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 " +
  "dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/30";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

const primaryButton =
  "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors " +
  "hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 " +
  "focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-slate-950";

const secondaryButton =
  "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 " +
  "hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 " +
  "disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900";

// Set to false to keep the camera running after you leave the page
const STOP_CAMERA_WHEN_LEAVING = true;



export function WebRTCLoopback() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const connections = useRef<RTCPeerConnection[]>([]);
  const [status, setStatus] = useState("Not started");

  async function start() {
    try {
      setStatus("Requesting camera permission...");

      // Must be triggered by the user's click.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      localStream.current = stream;
      if (localVideo.current) localVideo.current.srcObject = stream;

      const sender = new RTCPeerConnection();
      const receiver = new RTCPeerConnection();
      connections.current = [sender, receiver];

      receiver.ontrack = (event) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
      };

      // For this same-browser test, wait until local ICE candidates
      // have been gathered before passing connection details directly.
      const waitForIce = (pc: RTCPeerConnection) =>
        pc.iceGatheringState === "complete"
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              pc.addEventListener("icegatheringstatechange", () => {
                if (pc.iceGatheringState === "complete") resolve();
              });
            });

      stream.getTracks().forEach((track) => sender.addTrack(track, stream));

      await sender.setLocalDescription(await sender.createOffer());
      await waitForIce(sender);
      await receiver.setRemoteDescription(sender.localDescription!);

      await receiver.setLocalDescription(await receiver.createAnswer());
      await waitForIce(receiver);
      await sender.setRemoteDescription(receiver.localDescription!);

      setStatus("Connected locally — this is not a second device.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not start.");
    }
  }

  function stop() {
    connections.current.forEach((pc) => pc.close());
    connections.current = [];

    localStream.current?.getTracks().forEach((track) => track.stop());
    localStream.current = null;

    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;

    setStatus("Stopped");
  }

  return (
    <section>
      <p>{status}</p>
      <button type="button" onClick={start}>Start local test</button>
      <button type="button" onClick={stop}>Stop</button>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p>Camera stream</p>
          <video ref={localVideo} autoPlay muted playsInline width={320} />
        </div>
        <div>
          <p>WebRTC received stream</p>
          <video ref={remoteVideo} autoPlay playsInline width={320} />
        </div>
      </div>
    </section>
  );
}


export function TwoPersonCall() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const roleRef = useRef("");
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const offerStarted = useRef(false);

  const [roomId, setRoomId] = useState("thesis-demo-42");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Not connected");

  function send(message: object) {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  async function start() {
    if (wsRef.current || pcRef.current) return;

    const room = roomId.trim();
    if (!room) {
      setStatus("Enter a room ID.");
      return;
    }

    try {
      setStatus("Requesting camera permission...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      if (localVideo.current) localVideo.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          send({ type: "ice-candidate", candidate: event.candidate });
        }
      };

      pc.onconnectionstatechange = () => {
        setStatus(`Call connection: ${pc.connectionState}`);
      };

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(
        `${protocol}//${window.location.hostname}:3001`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        send({ type: "join", roomId: room });
        setStatus("Connected to signaling server; waiting for the other person...");
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "joined") {
            roleRef.current = message.role;
            setRole(message.role);
            return;
          }

          if (message.type === "peer-ready") {
            setStatus("Both participants joined.");

            // The first participant creates the offer.
            if (roleRef.current === "caller" && !offerStarted.current) {
              offerStarted.current = true;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              send({ type: "offer", description: pc.localDescription });
            }
            return;
          }

          if (message.type === "offer") {
            await pc.setRemoteDescription(message.description);

            for (const candidate of pendingCandidates.current) {
              await pc.addIceCandidate(candidate);
            }
            pendingCandidates.current = [];

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            send({ type: "answer", description: pc.localDescription });
            return;
          }

          if (message.type === "answer") {
            await pc.setRemoteDescription(message.description);

            for (const candidate of pendingCandidates.current) {
              await pc.addIceCandidate(candidate);
            }
            pendingCandidates.current = [];
            return;
          }

          if (message.type === "ice-candidate") {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(message.candidate);
            } else {
              // ICE can arrive before the offer/answer is applied.
              pendingCandidates.current.push(message.candidate);
            }
            return;
          }

          if (message.type === "peer-left") {
            setStatus("The other participant left.");
          }

          if (message.type === "error") {
            setStatus(message.message);
          }
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Signaling error.");
        }
      };

      ws.onerror = () => setStatus("Could not connect to the signaling server.");
      ws.onclose = () => {
        if (wsRef.current === ws) setStatus("Signaling connection closed.");
      };
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not start the call.");
    }
  }

  function stop() {
    wsRef.current?.close();
    wsRef.current = null;

    pcRef.current?.close();
    pcRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;

    roleRef.current = "";
    pendingCandidates.current = [];
    offerStarted.current = false;
    setRole("");
    setStatus("Call stopped.");
  }

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      pcRef.current?.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <section>
      <h2>Two-person WebRTC test</h2>

      <label>
        Room ID{" "}
        <input
          value={roomId}
          onChange={(event) => setRoomId(event.target.value)}
          disabled={Boolean(wsRef.current)}
        />
      </label>

      <p>Status: {status}</p>
      {role && <p>Your role: {role}</p>}

      <button type="button" onClick={start}>Join call</button>
      <button type="button" onClick={stop}>Leave call</button>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p>Your camera</p>
          <video ref={localVideo} autoPlay muted playsInline width={320} />
        </div>
        <div>
          <p>Other participant</p>
          <video ref={remoteVideo} autoPlay playsInline width={320} />
        </div>
      </div>
    </section>
  );
}

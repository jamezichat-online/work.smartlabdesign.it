/* SmartLab CWE 0.1.0-alpha — timeline.ts adapted to browser JS.
Source: jamezichat-online/smartlab-cinematic-web-engine. */
const clamp01 = (value) => Math.min(1, Math.max(0, value));

function resolveFrame(progress, timeline, frameCount) {
  const p = clamp01(progress);
  const segment = timeline.segments.find((s, i) =>
    p >= s.start && (p < s.end || (i === timeline.segments.length - 1 && p <= s.end))
  ) ?? timeline.segments[timeline.segments.length - 1];

  if (!segment) return 0;
  if (segment.type === 'hold') return Math.min(frameCount - 1, Math.max(0, segment.frame));

  const local = segment.end === segment.start ? 1 : (p - segment.start) / (segment.end - segment.start);
  const [from, to] = segment.frames;
  const frame = Math.round(from + clamp01(local) * (to - from));
  return Math.min(frameCount - 1, Math.max(0, frame));
}
window.SmartLabCWE={resolveFrame,version:'0.1.0-alpha'};

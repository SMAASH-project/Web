import { releases } from "@/types/PageTypes";

export function Releases() {
  return (
    <div>
      <h2>Releases</h2>
      <ul>
        {releases.map((release) => (
          <li key={release.id}>
            <h3>{release.version}</h3>
            <p>Supports: {release.supports.join(", ")}</p>
            <p>Created At: {release.createdAt.toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEditorStore } from "../../editor/store/editor-store";

export function SceneLights() {
  const showShadows = useEditorStore((state) => state.display.showShadows);

  return (
    <>
      <ambientLight intensity={0.35} color="#d9f4ff" />
      <directionalLight
        castShadow={showShadows}
        intensity={2.8}
        color="#f8fbff"
        position={[6, 9, 5]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.00008}
      />
      <pointLight intensity={18} distance={18} color="#22d3ee" position={[-6, 3, -4]} />
    </>
  );
}

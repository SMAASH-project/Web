import { fireEvent, render, screen } from "@testing-library/react";
import { ItemFilters } from "@/pages/webstore/components/ItemFilters";

vi.mock("@/pages/settings/SettingsContext", () => ({
  useSettings: () => ({
    settings: {
      useAnimations: true,
      useLiquidGlass: false,
      useDarkMode: false,
      language: "en",
      animationOverride: null,
    },
    updateSetting: vi.fn(),
  }),
}));

describe("ItemFilters", () => {
  it("calls onSelect with the clicked option", () => {
    const onSelect = vi.fn();

    render(
      <ItemFilters
        label="Rarity"
        options={["All", "Rare", "Epic"]}
        selected="All"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByText("Rare"));
    expect(onSelect).toHaveBeenCalledWith("Rare");
  });
});

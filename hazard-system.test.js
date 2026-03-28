const HazardSystem = require("./hazard-system");

describe("HazardSystem", () => {
  let hazardSystem;

  beforeEach(() => {
    hazardSystem = new HazardSystem();
  });

  describe("initializeHazards()", () => {
    test("should initialize empty hazards array if level has no hazards", () => {
      const levelDef = { hazards: undefined };
      hazardSystem.initializeHazards(levelDef);
      expect(hazardSystem.hazards).toEqual([]);
    });

    test("should initialize hazards from level definition", () => {
      const levelDef = {
        hazards: [
          { type: "fire", x: 100, y: 200, w: 50, h: 30 },
          { type: "trap", x: 300, y: 200, w: 50, h: 30 },
        ],
      };
      hazardSystem.initializeHazards(levelDef);
      expect(hazardSystem.hazards.length).toBe(2);
      expect(hazardSystem.hazards[0].type).toBe("fire");
      expect(hazardSystem.hazards[1].type).toBe("trap");
    });

    test("should set all initialized hazards as active", () => {
      const levelDef = {
        hazards: [{ type: "fire", x: 100, y: 200, w: 50, h: 30 }],
      };
      hazardSystem.initializeHazards(levelDef);
      expect(hazardSystem.hazards[0].active).toBe(true);
    });

    test("should use default width and height if not provided", () => {
      const levelDef = {
        hazards: [{ type: "fire", x: 100, y: 200 }],
      };
      hazardSystem.initializeHazards(levelDef);
      expect(hazardSystem.hazards[0].w).toBe(40);
      expect(hazardSystem.hazards[0].h).toBe(20);
    });

    test("should clear previous hazards on reinitialize", () => {
      hazardSystem.initializeHazards({
        hazards: [{ type: "fire", x: 100, y: 200, w: 50, h: 30 }],
      });
      expect(hazardSystem.hazards.length).toBe(1);

      hazardSystem.initializeHazards({
        hazards: [
          { type: "trap", x: 300, y: 200, w: 50, h: 30 },
          { type: "fire", x: 500, y: 200, w: 50, h: 30 },
        ],
      });
      expect(hazardSystem.hazards.length).toBe(2);
    });
  });

  describe("checkCollision()", () => {
    beforeEach(() => {
      hazardSystem.initializeHazards({
        hazards: [
          { type: "fire", x: 100, y: 200, w: 50, h: 30 },
          { type: "trap", x: 300, y: 200, w: 50, h: 30 },
        ],
      });
    });

    test("should detect collision when player overlaps hazard", () => {
      const player = { x: 85, y: 190, w: 36, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).not.toBeNull();
      expect(hazard.type).toBe("fire");
    });

    test("should not detect collision when player does not overlap hazard", () => {
      const player = { x: 200, y: 190, w: 36, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).toBeNull();
    });

    test("should detect collision at hazard left edge", () => {
      const player = { x: 65, y: 190, w: 36, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).not.toBeNull();
    });

    test("should detect collision at hazard right edge", () => {
      const player = { x: 125, y: 190, w: 36, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).not.toBeNull();
    });

    test("should detect collision at hazard top edge", () => {
      const player = { x: 85, y: 170, w: 36, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).not.toBeNull();
    });

    test("should detect collision at hazard bottom edge", () => {
      const player = { x: 85, y: 210, w: 36, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).not.toBeNull();
    });

    test("should not detect collision with inactive hazards", () => {
      const player = { x: 85, y: 190, w: 36, h: 44 };
      hazardSystem.hazards[0].active = false;
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).toBeNull();
    });

    test("should return first collision (multiple overlaps)", () => {
      // Player overlaps both hazards
      const player = { x: 100, y: 190, w: 200, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard.type).toBe("fire"); // First one in array
    });

    test("should not detect collision when player just misses left", () => {
      const player = { x: 30, y: 190, w: 34, h: 44 }; // 30+34=64, hazard starts at 75
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).toBeNull();
    });

    test("should not detect collision when player just misses right", () => {
      const player = { x: 126, y: 190, w: 36, h: 44 }; // 126+36=162, hazard ends at 125
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).toBeNull();
    });

    test("should not detect collision when player just misses top", () => {
      const player = { x: 85, y: 125, w: 36, h: 44 }; // 125+44=169, hazard starts at 170
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).toBeNull();
    });

    test("should not detect collision when player just misses bottom", () => {
      const player = { x: 85, y: 231, w: 36, h: 44 }; // 231 > 230 (hazard bottom)
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).toBeNull();
    });
  });

  describe("deactivateHazard()", () => {
    test("should deactivate a hazard", () => {
      hazardSystem.initializeHazards({
        hazards: [{ type: "fire", x: 100, y: 200, w: 50, h: 30 }],
      });
      const hazard = hazardSystem.hazards[0];
      expect(hazard.active).toBe(true);
      hazardSystem.deactivateHazard(hazard);
      expect(hazard.active).toBe(false);
    });
  });

  describe("getActiveHazards()", () => {
    test("should return all active hazards", () => {
      hazardSystem.initializeHazards({
        hazards: [
          { type: "fire", x: 100, y: 200, w: 50, h: 30 },
          { type: "trap", x: 300, y: 200, w: 50, h: 30 },
        ],
      });
      const active = hazardSystem.getActiveHazards();
      expect(active.length).toBe(2);
    });

    test("should not include inactive hazards", () => {
      hazardSystem.initializeHazards({
        hazards: [
          { type: "fire", x: 100, y: 200, w: 50, h: 30 },
          { type: "trap", x: 300, y: 200, w: 50, h: 30 },
        ],
      });
      hazardSystem.deactivateHazard(hazardSystem.hazards[0]);
      const active = hazardSystem.getActiveHazards();
      expect(active.length).toBe(1);
      expect(active[0].type).toBe("trap");
    });
  });

  describe("resetHazards()", () => {
    test("should reactivate all hazards", () => {
      hazardSystem.initializeHazards({
        hazards: [
          { type: "fire", x: 100, y: 200, w: 50, h: 30 },
          { type: "trap", x: 300, y: 200, w: 50, h: 30 },
        ],
      });
      hazardSystem.deactivateHazard(hazardSystem.hazards[0]);
      hazardSystem.deactivateHazard(hazardSystem.hazards[1]);
      expect(hazardSystem.getActiveHazards().length).toBe(0);
      hazardSystem.resetHazards();
      expect(hazardSystem.getActiveHazards().length).toBe(2);
    });
  });

  describe("getHazardAt()", () => {
    beforeEach(() => {
      hazardSystem.initializeHazards({
        hazards: [{ type: "fire", x: 100, y: 200, w: 50, h: 30 }],
      });
    });

    test("should find hazard at specific coordinates", () => {
      const hazard = hazardSystem.getHazardAt(100, 200);
      expect(hazard).not.toBeNull();
      expect(hazard.type).toBe("fire");
    });

    test("should find hazard within bounding box", () => {
      const hazard = hazardSystem.getHazardAt(90, 190);
      expect(hazard).not.toBeNull();
    });

    test("should not find hazard outside bounding box", () => {
      const hazard = hazardSystem.getHazardAt(50, 50);
      expect(hazard).toBeNull();
    });

    test("should return null if no hazard at coordinates", () => {
      const hazard = hazardSystem.getHazardAt(200, 200);
      expect(hazard).toBeNull();
    });
  });

  describe("Edge cases and integration", () => {
    test("should handle zero hazards", () => {
      const player = { x: 100, y: 200, w: 36, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).toBeNull();
    });

    test("should handle large number of hazards", () => {
      const hazardsArray = [];
      for (let i = 0; i < 100; i++) {
        hazardsArray.push({
          type: i % 2 === 0 ? "fire" : "trap",
          x: i * 100,
          y: 200,
          w: 50,
          h: 30,
        });
      }
      hazardSystem.initializeHazards({ hazards: hazardsArray });
      expect(hazardSystem.hazards.length).toBe(100);
    });

    test("should handle player completely inside hazard", () => {
      hazardSystem.initializeHazards({
        hazards: [{ type: "fire", x: 100, y: 200, w: 100, h: 100 }],
      });
      const player = { x: 80, y: 180, w: 36, h: 44 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).not.toBeNull();
    });

    test("should handle tiny player near hazard boundary", () => {
      hazardSystem.initializeHazards({
        hazards: [{ type: "fire", x: 100, y: 200, w: 50, h: 30 }],
      });
      const player = { x: 75, y: 200, w: 0.1, h: 0.1 };
      const hazard = hazardSystem.checkCollision(player);
      expect(hazard).not.toBeNull();
    });
  });
});

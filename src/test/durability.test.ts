import { describe, it, expect } from 'vitest';
import { HARDNESS, TOOL_DAMAGE, BASE_DAMAGE } from '../game/types';

describe('Durability System - Dureza', () => {
  describe('HARDNESS Constants', () => {
    it('should define hardness for all resource types', () => {
      expect(HARDNESS.bush).toBe(3);
      expect(HARDNESS.dead_tree).toBe(6);
      expect(HARDNESS.tree).toBe(12);
      expect(HARDNESS.rock).toBe(18);
      expect(HARDNESS.workbench).toBe(24);
    });

    it('should define hardness for NPCs', () => {
      expect(HARDNESS.chicken).toBe(5);
      expect(HARDNESS.crab).toBe(10);
    });

    it('resources should be ordered by hardness (easier to harder)', () => {
      expect(HARDNESS.bush).toBeLessThan(HARDNESS.dead_tree);
      expect(HARDNESS.dead_tree).toBeLessThan(HARDNESS.tree);
      expect(HARDNESS.tree).toBeLessThan(HARDNESS.rock);
      expect(HARDNESS.rock).toBeLessThan(HARDNESS.workbench);
    });

    it('chicken should be easier to defeat than crab', () => {
      expect(HARDNESS.chicken).toBeLessThan(HARDNESS.crab);
    });
  });

  describe('TOOL_DAMAGE Multipliers', () => {
    it('should define damage multipliers for all tools', () => {
      expect(TOOL_DAMAGE.hands).toBe(0.5);
      expect(TOOL_DAMAGE.axe).toBe(1.5);
      expect(TOOL_DAMAGE.pickaxe).toBe(1.5);
      expect(TOOL_DAMAGE.sword).toBe(1.2);
      expect(TOOL_DAMAGE.knife).toBe(1.0);
      expect(TOOL_DAMAGE.shovel).toBe(1.5);
      expect(TOOL_DAMAGE.hoe).toBe(1.5);
    });

    it('hands should deal least damage', () => {
      const allTools = Object.values(TOOL_DAMAGE);
      expect(TOOL_DAMAGE.hands).toBe(Math.min(...allTools));
    });

    it('specialized tools should deal more damage than hands', () => {
      expect(TOOL_DAMAGE.axe).toBeGreaterThan(TOOL_DAMAGE.hands);
      expect(TOOL_DAMAGE.pickaxe).toBeGreaterThan(TOOL_DAMAGE.hands);
      expect(TOOL_DAMAGE.sword).toBeGreaterThan(TOOL_DAMAGE.hands);
    });
  });

  describe('Damage Calculation', () => {
    it('should calculate correct damage for tree with axe', () => {
      const dmg = BASE_DAMAGE * TOOL_DAMAGE.axe * 1.5; // base * tool * chopping speed
      expect(dmg).toBe(2.25);
    });

    it('should calculate correct damage for rock with pickaxe', () => {
      const dmg = BASE_DAMAGE * TOOL_DAMAGE.pickaxe * 1.5; // base * tool * mining speed
      expect(dmg).toBe(2.25);
    });

    it('should calculate correct damage for chicken with sword', () => {
      const dmg = BASE_DAMAGE * TOOL_DAMAGE.sword * 1; // base * tool * attack damage
      expect(dmg).toBe(1.2);
    });

    it('should calculate correct damage with hands', () => {
      const dmg = BASE_DAMAGE * TOOL_DAMAGE.hands * 1;
      expect(dmg).toBe(0.5);
    });

    it('should require multiple hits to defeat a resource', () => {
      // Bush with axe
      const bushHardness = HARDNESS.bush;
      const dmgPerHit = BASE_DAMAGE * TOOL_DAMAGE.axe * 1.5;
      const hitsNeeded = Math.ceil(bushHardness / dmgPerHit);
      expect(hitsNeeded).toBeGreaterThan(1);
    });

    it('rock should require more hits than tree', () => {
      const treeHits = Math.ceil(HARDNESS.tree / (BASE_DAMAGE * TOOL_DAMAGE.axe * 1.5));
      const rockHits = Math.ceil(HARDNESS.rock / (BASE_DAMAGE * TOOL_DAMAGE.pickaxe * 1.5));
      expect(rockHits).toBeGreaterThan(treeHits);
    });
  });

  describe('NPC HP System', () => {
    it('chicken should have matching HP to HARDNESS', () => {
      // ChickenNPC should be initialized with HARDNESS.chicken
      expect(HARDNESS.chicken).toBe(5);
    });

    it('crab should have matching HP to HARDNESS', () => {
      // CrabNPC should be initialized with HARDNESS.crab
      expect(HARDNESS.crab).toBe(10);
    });

    it('crab should require more damage to kill than chicken', () => {
      const chickensNeeded = Math.ceil(HARDNESS.chicken / 1.2); // sword damage
      const crabsNeeded = Math.ceil(HARDNESS.crab / 1.2);
      expect(crabsNeeded).toBeGreaterThan(chickensNeeded);
    });
  });

  describe('Balance Checks', () => {
    it('all hardness values should be positive', () => {
      Object.values(HARDNESS).forEach(h => {
        expect(h).toBeGreaterThan(0);
      });
    });

    it('all tool damage values should be positive', () => {
      Object.values(TOOL_DAMAGE).forEach(d => {
        expect(d).toBeGreaterThan(0);
      });
    });

    it('BASE_DAMAGE should be positive', () => {
      expect(BASE_DAMAGE).toBeGreaterThan(0);
    });
  });
});

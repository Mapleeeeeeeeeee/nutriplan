/**
 * useMenuStats Hook Unit Tests
 * 
 * Tests for the nutrition statistics calculation hook.
 * Following naming convention: should_ExpectedBehavior_When_Condition
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMenuStats } from '../hooks/useMenuStats';
import { MenuPlan, FoodItem, FoodCategory, DailyItems, MealData } from '../types';

// ============================================================================
// Test Fixtures
// ============================================================================

const createEmptyMealData = (): MealData => ({ entries: [] });

const createEmptyDay = (): DailyItems => ({
    breakfast: createEmptyMealData(),
    lunch: createEmptyMealData(),
    dinner: createEmptyMealData(),
    snack: createEmptyMealData(),
});

const createBasicPlan = (overrides?: Partial<MenuPlan>): MenuPlan => ({
    id: 'test-plan',
    name: 'Test Plan',
    type: 'single',
    cycleDays: 1,
    targetCalories: 1500,
    macroRatio: { protein: 20, carbs: 50, fat: 30 },
    targetPortions: { staple: 3, meat: 5, vegetable: 3, fruit: 2, dairy: 1, fat: 3, other: 0 },
    createdAt: Date.now(),
    days: [createEmptyDay()],
    notes: [''],
    ...overrides,
});

const mockFoods: FoodItem[] = [
    {
        id: 'chicken-breast',
        name: '雞胸肉',
        portionSize: 35,
        portionUnit: 'g',
        caloriesPerPortion: 55,
        proteinPerPortion: 7,
        carbsPerPortion: 0,
        fatPerPortion: 3,
        category: 'meat',
        fatLevel: 'low',
    },
    {
        id: 'white-rice',
        name: '白飯',
        portionSize: 40,
        portionUnit: 'g',
        caloriesPerPortion: 70,
        proteinPerPortion: 2,
        carbsPerPortion: 15,
        fatPerPortion: 0,
        category: 'staple',
    },
    {
        id: 'full-milk',
        name: '全脂鮮乳',
        portionSize: 240,
        portionUnit: 'ml',
        caloriesPerPortion: 150,
        proteinPerPortion: 8,
        carbsPerPortion: 12,
        fatPerPortion: 8,
        category: 'dairy',
        fatLevel: 'full',
    },
];

// ============================================================================
// Test Case List: Empty Plan
// ============================================================================
// TC-EMPTY-001: Should return zero totals for empty plan
// TC-EMPTY-002: Should return zero portions for empty plan
// TC-EMPTY-003: Should calculate target grams based on target calories
// ============================================================================

describe('useMenuStats', () => {
    describe('Empty Plan', () => {
        it('should_ReturnZeroTotals_When_PlanHasNoEntries', () => {
            // Arrange
            const plan = createBasicPlan();

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            expect(result.current.stats.dayStats[0].totals).toEqual({
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            });
        });

        it('should_ReturnZeroPortions_When_PlanHasNoEntries', () => {
            // Arrange
            const plan = createBasicPlan();

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            const portions = result.current.stats.dayStats[0].portions;
            Object.values(portions).forEach(value => {
                expect(value).toBe(0);
            });
        });

        it('should_CalculateTargetGrams_When_GivenTargetCaloriesAndMacros', () => {
            // Arrange
            const plan = createBasicPlan({
                targetCalories: 2000,
                macroRatio: { protein: 25, carbs: 50, fat: 25 },
            });

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            // Protein: 2000 * 0.25 / 4 = 125g
            // Carbs: 2000 * 0.50 / 4 = 250g
            // Fat: 2000 * 0.25 / 9 ≈ 55.56g
            expect(result.current.targetGrams.protein).toBeCloseTo(125);
            expect(result.current.targetGrams.carbs).toBeCloseTo(250);
            expect(result.current.targetGrams.fat).toBeCloseTo(55.56, 1);
        });
    });

    // ============================================================================
    // Test Case List: Single Entry Mode
    // ============================================================================
    // TC-SINGLE-001: Should calculate totals correctly for single entry
    // TC-SINGLE-002: Should calculate portions correctly for single entry
    // TC-SINGLE-003: Should sum multiple entries correctly
    // TC-SINGLE-004: Should apply cooking modifier to calories and fat
    // ============================================================================

    describe('Single Entry Mode', () => {
        it('should_CalculateTotalsCorrectly_When_SingleEntryAdded', () => {
            // Arrange
            const plan = createBasicPlan();
            plan.days[0].breakfast.entries = [
                {
                    id: 'entry-1',
                    foodId: 'chicken-breast',
                    amount: 2,
                    cookingMethod: 'original',
                    portionDescription: '2 份肉類',
                    portionValue: 2,
                },
            ];

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            // 2 portions of chicken: 55 * 2 = 110 kcal, 7 * 2 = 14g protein
            expect(result.current.stats.dayStats[0].totals.calories).toBe(110);
            expect(result.current.stats.dayStats[0].totals.protein).toBe(14);
        });

        it('should_CalculatePortionsCorrectly_When_SingleEntryAdded', () => {
            // Arrange
            const plan = createBasicPlan();
            plan.days[0].breakfast.entries = [
                {
                    id: 'entry-1',
                    foodId: 'chicken-breast',
                    amount: 2,
                    cookingMethod: 'original',
                    portionDescription: '2 份肉類',
                    portionValue: 2,
                },
            ];

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            expect(result.current.stats.dayStats[0].portions.meat).toBe(2);
        });

        it('should_SumMultipleEntriesCorrectly_When_MultipleEntriesInMeal', () => {
            // Arrange
            const plan = createBasicPlan();
            plan.days[0].breakfast.entries = [
                {
                    id: 'entry-1',
                    foodId: 'chicken-breast',
                    amount: 1,
                    cookingMethod: 'original',
                    portionDescription: '1 份肉類',
                    portionValue: 1,
                },
                {
                    id: 'entry-2',
                    foodId: 'white-rice',
                    amount: 2,
                    cookingMethod: 'original',
                    portionDescription: '2 份全穀',
                    portionValue: 2,
                },
            ];

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            // Chicken: 55 kcal, 7g protein, 0g carbs, 3g fat
            // Rice x2: 140 kcal, 4g protein, 30g carbs, 0g fat
            // Total: 195 kcal, 11g protein, 30g carbs, 3g fat
            expect(result.current.stats.dayStats[0].totals.calories).toBe(195);
            expect(result.current.stats.dayStats[0].totals.protein).toBe(11);
            expect(result.current.stats.dayStats[0].totals.carbs).toBe(30);
            expect(result.current.stats.dayStats[0].totals.fat).toBe(3);
        });

        it('should_ApplyCookingModifier_When_CookingMethodIsStirFried', () => {
            // Arrange
            const plan = createBasicPlan();
            plan.days[0].breakfast.entries = [
                {
                    id: 'entry-1',
                    foodId: 'chicken-breast',
                    amount: 1,
                    cookingMethod: 'stir_fried', // adds 45 cal, 5g fat
                    portionDescription: '1 份肉類',
                    portionValue: 1,
                },
            ];

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            // Chicken: 55 + 45 = 100 kcal, 3 + 5 = 8g fat
            expect(result.current.stats.dayStats[0].totals.calories).toBe(100);
            expect(result.current.stats.dayStats[0].totals.fat).toBe(8);
        });
    });

    // ============================================================================
    // Test Case List: Multiple Days
    // ============================================================================
    // TC-MULTI-001: Should calculate stats per day independently
    // ============================================================================

    describe('Multiple Days', () => {
        it('should_CalculateStatsPerDay_When_MultipleDaysExist', () => {
            // Arrange
            const plan = createBasicPlan({
                type: 'cycle',
                cycleDays: 2,
                days: [createEmptyDay(), createEmptyDay()],
            });
            plan.days[0].breakfast.entries = [
                {
                    id: 'entry-1',
                    foodId: 'chicken-breast',
                    amount: 1,
                    cookingMethod: 'original',
                    portionDescription: '1 份',
                    portionValue: 1,
                },
            ];
            plan.days[1].breakfast.entries = [
                {
                    id: 'entry-2',
                    foodId: 'full-milk',
                    amount: 1,
                    cookingMethod: 'original',
                    portionDescription: '1 份乳品',
                    portionValue: 1,
                },
            ];

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            expect(result.current.stats.dayStats[0].totals.calories).toBe(55);
            expect(result.current.stats.dayStats[1].totals.calories).toBe(150);
        });
    });

    // ============================================================================
    // Test Case List: Unknown Food Handling
    // ============================================================================
    // TC-UNKNOWN-001: Should ignore entries with unknown food IDs
    // ============================================================================

    describe('Unknown Food Handling', () => {
        it('should_IgnoreEntry_When_FoodIdNotFound', () => {
            // Arrange
            const plan = createBasicPlan();
            plan.days[0].breakfast.entries = [
                {
                    id: 'entry-1',
                    foodId: 'non-existent-food',
                    amount: 1,
                    cookingMethod: 'original',
                    portionDescription: '1 份',
                    portionValue: 1,
                },
            ];

            // Act
            const { result } = renderHook(() => useMenuStats(plan, mockFoods));

            // Assert
            expect(result.current.stats.dayStats[0].totals.calories).toBe(0);
        });
    });

    // ============================================================================
    // Test Case List: DetailedPortions Tracking
    // ============================================================================
    // TC-DETAILED-001: Should track meat portions by fat level separately
    // TC-DETAILED-002: Should track dairy portions by fat level separately
    // TC-DETAILED-003: Should return zero detailedPortions for empty plan
    // ============================================================================

    describe('DetailedPortions Tracking', () => {
        const detailedMockFoods: FoodItem[] = [
            ...mockFoods,
            {
                id: 'pork-belly',
                name: '五花肉',
                portionSize: 35,
                portionUnit: 'g',
                caloriesPerPortion: 120,
                proteinPerPortion: 7,
                carbsPerPortion: 0,
                fatPerPortion: 10,
                category: 'meat',
                fatLevel: 'high',
            },
            {
                id: 'egg',
                name: '雞蛋',
                portionSize: 55,
                portionUnit: 'g',
                caloriesPerPortion: 75,
                proteinPerPortion: 7,
                carbsPerPortion: 0,
                fatPerPortion: 5,
                category: 'meat',
                fatLevel: 'medium',
            },
            {
                id: 'low-fat-milk',
                name: '低脂鮮乳',
                portionSize: 240,
                portionUnit: 'ml',
                caloriesPerPortion: 120,
                proteinPerPortion: 8,
                carbsPerPortion: 12,
                fatPerPortion: 4,
                category: 'dairy',
                fatLevel: 'low',
            },
            {
                id: 'skim-milk',
                name: '脫脂鮮乳',
                portionSize: 240,
                portionUnit: 'ml',
                caloriesPerPortion: 80,
                proteinPerPortion: 8,
                carbsPerPortion: 12,
                fatPerPortion: 0,
                category: 'dairy',
                fatLevel: 'skim',
            },
        ];

        it('should_ReturnZeroDetailedPortions_When_PlanHasNoEntries', () => {
            // Arrange
            const plan = createBasicPlan();

            // Act
            const { result } = renderHook(() => useMenuStats(plan, detailedMockFoods));

            // Assert
            const detailedPortions = result.current.stats.dayStats[0].detailedPortions;
            expect(detailedPortions.meatLow).toBe(0);
            expect(detailedPortions.meatMedium).toBe(0);
            expect(detailedPortions.meatHigh).toBe(0);
            expect(detailedPortions.dairyFull).toBe(0);
            expect(detailedPortions.dairyLow).toBe(0);
            expect(detailedPortions.dairySkim).toBe(0);
        });

        it('should_TrackMeatPortions_ByFatLevel_Separately', () => {
            // Arrange
            const plan = createBasicPlan();
            plan.days[0].breakfast.entries = [
                {
                    id: 'entry-1',
                    foodId: 'chicken-breast', // low fat
                    amount: 2,
                    cookingMethod: 'original',
                    portionDescription: '2 份',
                    portionValue: 2,
                },
            ];
            plan.days[0].lunch.entries = [
                {
                    id: 'entry-2',
                    foodId: 'egg', // medium fat
                    amount: 1,
                    cookingMethod: 'original',
                    portionDescription: '1 份',
                    portionValue: 1,
                },
                {
                    id: 'entry-3',
                    foodId: 'pork-belly', // high fat
                    amount: 1.5,
                    cookingMethod: 'original',
                    portionDescription: '1.5 份',
                    portionValue: 1.5,
                },
            ];

            // Act
            const { result } = renderHook(() => useMenuStats(plan, detailedMockFoods));

            // Assert
            const detailedPortions = result.current.stats.dayStats[0].detailedPortions;
            expect(detailedPortions.meatLow).toBe(2);
            expect(detailedPortions.meatMedium).toBe(1);
            expect(detailedPortions.meatHigh).toBe(1.5);
        });

        it('should_TrackDairyPortions_ByFatLevel_Separately', () => {
            // Arrange
            const plan = createBasicPlan();
            plan.days[0].breakfast.entries = [
                {
                    id: 'entry-1',
                    foodId: 'full-milk', // full fat
                    amount: 1,
                    cookingMethod: 'original',
                    portionDescription: '1 份',
                    portionValue: 1,
                },
            ];
            plan.days[0].snack.entries = [
                {
                    id: 'entry-2',
                    foodId: 'low-fat-milk', // low fat
                    amount: 2,
                    cookingMethod: 'original',
                    portionDescription: '2 份',
                    portionValue: 2,
                },
                {
                    id: 'entry-3',
                    foodId: 'skim-milk', // skim
                    amount: 0.5,
                    cookingMethod: 'original',
                    portionDescription: '0.5 份',
                    portionValue: 0.5,
                },
            ];

            // Act
            const { result } = renderHook(() => useMenuStats(plan, detailedMockFoods));

            // Assert
            const detailedPortions = result.current.stats.dayStats[0].detailedPortions;
            expect(detailedPortions.dairyFull).toBe(1);
            expect(detailedPortions.dairyLow).toBe(2);
            expect(detailedPortions.dairySkim).toBe(0.5);
        });
    });
});


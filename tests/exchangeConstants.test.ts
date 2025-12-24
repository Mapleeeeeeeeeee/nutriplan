/**
 * Exchange Constants Unit Tests
 * 
 * Tests for the food exchange standards based on Taiwan Health Ministry 2019.5 guidelines.
 * Following naming convention: should_ExpectedBehavior_When_Condition
 */
import { describe, it, expect } from 'vitest';
import {
    DAIRY_EXCHANGE,
    MEAT_EXCHANGE,
    STAPLE_EXCHANGE,
    VEGETABLE_EXCHANGE,
    FRUIT_EXCHANGE,
    FAT_EXCHANGE,
    getExchangeValue,
    DairyFatLevel,
    MeatFatLevel,
} from '../constants/exchangeConstants';

// ============================================================================
// Test Case List: DAIRY_EXCHANGE
// ============================================================================
// TC-DAIRY-001: Full fat dairy should have correct nutritional values
// TC-DAIRY-002: Low fat dairy should have correct nutritional values  
// TC-DAIRY-003: Skim dairy should have correct nutritional values
// TC-DAIRY-004: All dairy types should have consistent protein and carbs
// ============================================================================

describe('DAIRY_EXCHANGE', () => {
    describe('Full Fat Dairy', () => {
        it('should_HaveCorrectNutritionalValues_When_FullFatDairy', () => {
            // Arrange
            const expected = { protein: 8, fat: 8, carbs: 12, calories: 150 };

            // Act
            const actual = DAIRY_EXCHANGE.full;

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('Low Fat Dairy', () => {
        it('should_HaveCorrectNutritionalValues_When_LowFatDairy', () => {
            // Arrange
            const expected = { protein: 8, fat: 4, carbs: 12, calories: 120 };

            // Act
            const actual = DAIRY_EXCHANGE.low;

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('Skim Dairy', () => {
        it('should_HaveCorrectNutritionalValues_When_SkimDairy', () => {
            // Arrange
            const expected = { protein: 8, fat: 0, carbs: 12, calories: 80 };

            // Act
            const actual = DAIRY_EXCHANGE.skim;

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('Dairy Consistency', () => {
        it('should_HaveConsistentProteinAndCarbs_When_AnyDairyType', () => {
            // Arrange
            const dairyTypes: DairyFatLevel[] = ['full', 'low', 'skim'];

            // Act & Assert
            dairyTypes.forEach(type => {
                expect(DAIRY_EXCHANGE[type].protein).toBe(8);
                expect(DAIRY_EXCHANGE[type].carbs).toBe(12);
            });
        });
    });
});

// ============================================================================
// Test Case List: MEAT_EXCHANGE
// ============================================================================
// TC-MEAT-001: Low fat meat should have correct nutritional values
// TC-MEAT-002: Medium fat meat should have correct nutritional values
// TC-MEAT-003: High fat meat should have correct nutritional values
// TC-MEAT-004: All meat types should have zero carbs
// TC-MEAT-005: All meat types should have consistent protein
// ============================================================================

describe('MEAT_EXCHANGE', () => {
    describe('Low Fat Meat', () => {
        it('should_HaveCorrectNutritionalValues_When_LowFatMeat', () => {
            // Arrange
            const expected = { protein: 7, fat: 3, carbs: 0, calories: 55 };

            // Act
            const actual = MEAT_EXCHANGE.low;

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('Medium Fat Meat', () => {
        it('should_HaveCorrectNutritionalValues_When_MediumFatMeat', () => {
            // Arrange
            const expected = { protein: 7, fat: 5, carbs: 0, calories: 75 };

            // Act
            const actual = MEAT_EXCHANGE.medium;

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('High Fat Meat', () => {
        it('should_HaveCorrectNutritionalValues_When_HighFatMeat', () => {
            // Arrange
            const expected = { protein: 7, fat: 10, carbs: 0, calories: 120 };

            // Act
            const actual = MEAT_EXCHANGE.high;

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('Meat Consistency', () => {
        it('should_HaveZeroCarbs_When_AnyMeatType', () => {
            // Arrange
            const meatTypes: MeatFatLevel[] = ['low', 'medium', 'high'];

            // Act & Assert
            meatTypes.forEach(type => {
                expect(MEAT_EXCHANGE[type].carbs).toBe(0);
            });
        });

        it('should_HaveConsistentProtein_When_AnyMeatType', () => {
            // Arrange
            const meatTypes: MeatFatLevel[] = ['low', 'medium', 'high'];

            // Act & Assert
            meatTypes.forEach(type => {
                expect(MEAT_EXCHANGE[type].protein).toBe(7);
            });
        });
    });
});

// ============================================================================
// Test Case List: Other Food Categories
// ============================================================================
// TC-STAPLE-001: Staple exchange should have correct values
// TC-VEG-001: Vegetable exchange should have correct values
// TC-FRUIT-001: Fruit exchange should have correct values  
// TC-FAT-001: Fat exchange should have correct values
// ============================================================================

describe('Other Food Categories', () => {
    describe('STAPLE_EXCHANGE', () => {
        it('should_HaveCorrectNutritionalValues_When_StapleFood', () => {
            // Arrange
            const expected = { protein: 2, fat: 0, carbs: 15, calories: 70 };

            // Act & Assert
            expect(STAPLE_EXCHANGE).toEqual(expected);
        });
    });

    describe('VEGETABLE_EXCHANGE', () => {
        it('should_HaveCorrectNutritionalValues_When_Vegetable', () => {
            // Arrange
            const expected = { protein: 1, fat: 0, carbs: 5, calories: 25 };

            // Act & Assert
            expect(VEGETABLE_EXCHANGE).toEqual(expected);
        });
    });

    describe('FRUIT_EXCHANGE', () => {
        it('should_HaveCorrectNutritionalValues_When_Fruit', () => {
            // Arrange
            const expected = { protein: 0, fat: 0, carbs: 15, calories: 60 };

            // Act & Assert
            expect(FRUIT_EXCHANGE).toEqual(expected);
        });
    });

    describe('FAT_EXCHANGE', () => {
        it('should_HaveCorrectNutritionalValues_When_FatFood', () => {
            // Arrange
            const expected = { protein: 0, fat: 5, carbs: 0, calories: 45 };

            // Act & Assert
            expect(FAT_EXCHANGE).toEqual(expected);
        });
    });
});

// ============================================================================
// Test Case List: getExchangeValue Function
// ============================================================================
// TC-GET-001: Should return correct values for dairy with fat level
// TC-GET-002: Should return correct values for meat with fat level
// TC-GET-003: Should return staple values for staple category
// TC-GET-004: Should return default values when no fat level specified for dairy
// TC-GET-005: Should return default values when no fat level specified for meat
// TC-GET-006: Should return zero values for unknown category
// ============================================================================

describe('getExchangeValue', () => {
    describe('Dairy Category', () => {
        it('should_ReturnCorrectValues_When_DairyWithFatLevel', () => {
            // Arrange
            const category = 'dairy';
            const fatLevel = 'full';

            // Act
            const result = getExchangeValue(category, fatLevel);

            // Assert
            expect(result).toEqual(DAIRY_EXCHANGE.full);
        });

        it('should_ReturnLowFatDefault_When_DairyWithoutFatLevel', () => {
            // Arrange
            const category = 'dairy';

            // Act
            const result = getExchangeValue(category);

            // Assert
            expect(result).toEqual(DAIRY_EXCHANGE.low);
        });
    });

    describe('Meat Category', () => {
        it('should_ReturnCorrectValues_When_MeatWithFatLevel', () => {
            // Arrange
            const category = 'meat';
            const fatLevel = 'high';

            // Act
            const result = getExchangeValue(category, fatLevel);

            // Assert
            expect(result).toEqual(MEAT_EXCHANGE.high);
        });

        it('should_ReturnMediumFatDefault_When_MeatWithoutFatLevel', () => {
            // Arrange
            const category = 'meat';

            // Act
            const result = getExchangeValue(category);

            // Assert
            expect(result).toEqual(MEAT_EXCHANGE.medium);
        });
    });

    describe('Other Categories', () => {
        it('should_ReturnStapleValues_When_StapleCategory', () => {
            expect(getExchangeValue('staple')).toEqual(STAPLE_EXCHANGE);
        });

        it('should_ReturnVegetableValues_When_VegetableCategory', () => {
            expect(getExchangeValue('vegetable')).toEqual(VEGETABLE_EXCHANGE);
        });

        it('should_ReturnFruitValues_When_FruitCategory', () => {
            expect(getExchangeValue('fruit')).toEqual(FRUIT_EXCHANGE);
        });

        it('should_ReturnFatValues_When_FatCategory', () => {
            expect(getExchangeValue('fat')).toEqual(FAT_EXCHANGE);
        });
    });

    describe('Unknown Category', () => {
        it('should_ReturnZeroValues_When_UnknownCategory', () => {
            // Arrange
            const expected = { protein: 0, fat: 0, carbs: 0, calories: 0 };

            // Act
            const result = getExchangeValue('unknown' as any);

            // Assert
            expect(result).toEqual(expected);
        });
    });
});

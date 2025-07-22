/**
 * Utility for calculating user grades based on attended trainings
 */

const GRADE_THRESHOLDS = [
  { min: 0, max: 0, name: 'Новичок', emoji: '🥊', level: 0 },
  { min: 1, max: 4, name: 'Новичок', emoji: '🥊', level: 1 },
  { min: 5, max: 14, name: 'Практик', emoji: '💪', level: 2 },
  { min: 15, max: 29, name: 'Ученик', emoji: '🎓', level: 3 },
  { min: 30, max: 59, name: 'Боец', emoji: '🥋', level: 4 },
  { min: 60, max: 99, name: 'Воин', emoji: '⚔️', level: 5 },
  { min: 100, max: Infinity, name: 'Король джунглей', emoji: '🦁', level: 6 }
]

const LEVEL_THRESHOLDS = [0, 1, 5, 15, 30, 60, 100]

/**
 * Calculate grade based on attended trainings count
 * @param {number} attendedTrainings - Number of attended trainings
 * @returns {Object} Grade object with name, emoji, and level
 */
function calculateGrade(attendedTrainings) {
  const gradeInfo = GRADE_THRESHOLDS.find(grade => 
    attendedTrainings >= grade.min && attendedTrainings <= grade.max
  )
  
  return gradeInfo || GRADE_THRESHOLDS[0] // fallback to first grade
}

/**
 * Calculate progress to next level
 * @param {number} attendedTrainings - Number of attended trainings
 * @param {number} currentLevel - Current grade level
 * @returns {Object} Progress object with current, next, and percentage
 */
function calculateProgressToNextLevel(attendedTrainings, currentLevel) {
  if (currentLevel >= 6) {
    return {
      current: attendedTrainings,
      next: 100,
      percentage: 100
    }
  }
  
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel + 1] || 100
  const progress = Math.round((attendedTrainings / nextThreshold) * 100)
  
  return {
    current: attendedTrainings,
    next: nextThreshold,
    percentage: Math.min(progress, 100)
  }
}

/**
 * Get complete grade and progress information
 * @param {number} attendedTrainings - Number of attended trainings
 * @returns {Object} Complete grade information
 */
function getGradeInfo(attendedTrainings) {
  const grade = calculateGrade(attendedTrainings)
  const progress = calculateProgressToNextLevel(attendedTrainings, grade.level)
  
  return {
    grade,
    progress
  }
}

module.exports = {
  calculateGrade,
  calculateProgressToNextLevel,
  getGradeInfo,
  GRADE_THRESHOLDS,
  LEVEL_THRESHOLDS
}
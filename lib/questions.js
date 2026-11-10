// Original diagnostic items plus advanced stretch questions.
// Keep this module server-side: never import it into public browser assets.
export const QUESTIONS = [
  {
    "id": 1,
    "topic": "Numerical fluency",
    "skill": "Fraction subtraction",
    "level": "Foundation",
    "prompt": "Calculate 3/4 − 1/6.",
    "options": [
      "5/12",
      "7/12",
      "2/3",
      "1/2"
    ],
    "correct": 1,
    "explanation": "With denominator 12, 3/4 = 9/12 and 1/6 = 2/12, so the difference is 7/12."
  },
  {
    "id": 2,
    "topic": "Numerical fluency",
    "skill": "Signed numbers and brackets",
    "level": "Foundation",
    "prompt": "Evaluate −3(4 − 7) + 2.",
    "options": [
      "−11",
      "−7",
      "7",
      "11"
    ],
    "correct": 3,
    "explanation": "Inside the brackets, 4 − 7 = −3. Then (−3)(−3) + 2 = 9 + 2 = 11."
  },
  {
    "id": 3,
    "topic": "Numerical fluency",
    "skill": "Percent change",
    "level": "Foundation",
    "prompt": "An item costs $80. Its price increases by 15%. What is the new price?",
    "options": [
      "$88",
      "$92",
      "$95",
      "$68"
    ],
    "correct": 1,
    "explanation": "15% of 80 is 12; the new price is 80 + 12 = $92."
  },
  {
    "id": 4,
    "topic": "Numerical fluency",
    "skill": "Scientific notation",
    "level": "Foundation",
    "prompt": "Which scientific notation represents 0.0045?",
    "options": [
      "4.5 × 10⁻²",
      "4.5 × 10³",
      "4.5 × 10⁻³",
      "4.5 × 10⁻⁴"
    ],
    "correct": 2,
    "explanation": "Moving the decimal three places right gives 4.5, so 0.0045 = 4.5 × 10⁻³. Scientific notation needs 1 ≤ coefficient < 10."
  },
  {
    "id": 5,
    "topic": "Numerical fluency",
    "skill": "Fraction division",
    "level": "Foundation",
    "prompt": "Calculate (2/3) ÷ (4/9).",
    "options": [
      "8/27",
      "3/2",
      "2/3",
      "4/3"
    ],
    "correct": 1,
    "explanation": "Divide by multiplying by the reciprocal: (2/3) × (9/4) = 18/12 = 3/2."
  },
  {
    "id": 6,
    "topic": "Numerical fluency",
    "skill": "Percent conversion",
    "level": "Foundation",
    "prompt": "Express 5/8 as a percentage.",
    "options": [
      "58.5%",
      "60%",
      "62.5%",
      "65%"
    ],
    "correct": 2,
    "explanation": "5 ÷ 8 = 0.625, which is 62.5%."
  },
  {
    "id": 7,
    "topic": "Numerical fluency",
    "skill": "Ratios and proportionality",
    "level": "Foundation",
    "prompt": "Two quantities are in the ratio 3:5 and their total is 64. What is the smaller quantity?",
    "options": [
      "18",
      "24",
      "30",
      "40"
    ],
    "correct": 1,
    "explanation": "There are 8 equal ratio parts. Each is 64 ÷ 8 = 8, so the smaller quantity is 3 × 8 = 24."
  },
  {
    "id": 8,
    "topic": "Numerical fluency",
    "skill": "Order of operations",
    "level": "Foundation",
    "prompt": "Evaluate 18 − 2(3² − 5).",
    "options": [
      "10",
      "26",
      "8",
      "14"
    ],
    "correct": 0,
    "explanation": "3² = 9, so 3² − 5 = 4. Therefore 18 − 2 × 4 = 10."
  },
  {
    "id": 9,
    "topic": "Algebra and manipulation",
    "skill": "Distributive property",
    "level": "Foundation",
    "prompt": "Simplify 3(2x − 5) − 2(x + 1).",
    "options": [
      "4x − 13",
      "8x − 17",
      "4x − 17",
      "6x − 17"
    ],
    "correct": 2,
    "explanation": "Expand and combine: 6x − 15 − 2x − 2 = 4x − 17."
  },
  {
    "id": 10,
    "topic": "Algebra and manipulation",
    "skill": "Expanding binomials",
    "level": "Foundation",
    "prompt": "Expand (x + 4)(x − 3).",
    "options": [
      "x² − x − 12",
      "x² + x − 12",
      "x² + 7x − 12",
      "x² + x + 12"
    ],
    "correct": 1,
    "explanation": "Multiply each pair: x² − 3x + 4x − 12 = x² + x − 12."
  },
  {
    "id": 11,
    "topic": "Algebra and manipulation",
    "skill": "Factorising quadratics",
    "level": "Foundation",
    "prompt": "Factor x² − 9x + 20 completely.",
    "options": [
      "(x − 4)(x − 5)",
      "(x + 4)(x + 5)",
      "(x − 2)(x − 10)",
      "(x + 1)(x − 20)"
    ],
    "correct": 0,
    "explanation": "The numbers −4 and −5 multiply to 20 and add to −9."
  },
  {
    "id": 12,
    "topic": "Algebra and manipulation",
    "skill": "Laws of indices",
    "level": "Foundation",
    "prompt": "Simplify (2x²y)(−3xy³).",
    "options": [
      "−6x²y³",
      "−6x³y³",
      "6x³y⁴",
      "−6x³y⁴"
    ],
    "correct": 3,
    "explanation": "Multiply coefficients, then add exponents: 2(−3) = −6, x²x = x³ and yy³ = y⁴."
  },
  {
    "id": 13,
    "topic": "Algebra and manipulation",
    "skill": "Rational expressions",
    "level": "Intermediate",
    "prompt": "For x ≠ 4, simplify (x² − 16)/(x − 4).",
    "options": [
      "x − 4",
      "x + 4",
      "x² + 4",
      "1/(x + 4)"
    ],
    "correct": 1,
    "explanation": "Factor the numerator as (x − 4)(x + 4), then cancel x − 4 where x ≠ 4."
  },
  {
    "id": 14,
    "topic": "Algebra and manipulation",
    "skill": "Rearranging formulas",
    "level": "Intermediate",
    "prompt": "Given A = πr² with r > 0, express r in terms of A.",
    "options": [
      "r = A/(2π)",
      "r = A²/π",
      "r = √(A/π)",
      "r = √(A)/π"
    ],
    "correct": 2,
    "explanation": "Divide by π, then take the positive square root: r = √(A/π)."
  },
  {
    "id": 15,
    "topic": "Algebra and manipulation",
    "skill": "Substitution",
    "level": "Foundation",
    "prompt": "Find x² − 3x + 1 when x = −2.",
    "options": [
      "−1",
      "3",
      "9",
      "11"
    ],
    "correct": 3,
    "explanation": "(−2)² − 3(−2) + 1 = 4 + 6 + 1 = 11."
  },
  {
    "id": 16,
    "topic": "Algebra and manipulation",
    "skill": "Square of a binomial",
    "level": "Intermediate",
    "prompt": "What is the coefficient of x in the expansion of (x − 2)²?",
    "options": [
      "−4",
      "−2",
      "2",
      "4"
    ],
    "correct": 0,
    "explanation": "(x − 2)² = x² − 4x + 4, so the coefficient of x is −4."
  },
  {
    "id": 17,
    "topic": "Algebra and manipulation",
    "skill": "Adding rational expressions",
    "level": "Intermediate",
    "prompt": "For x ≠ 0, simplify 2/x + 3/(2x).",
    "options": [
      "5/(3x)",
      "7/(2x)",
      "5/(2x)",
      "7/(3x)"
    ],
    "correct": 1,
    "explanation": "Using denominator 2x gives 4/(2x) + 3/(2x) = 7/(2x)."
  },
  {
    "id": 18,
    "topic": "Equations and inequalities",
    "skill": "One-step linear equation",
    "level": "Foundation",
    "prompt": "Solve 5x − 7 = 18.",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2,
    "explanation": "Add 7 to both sides: 5x = 25, hence x = 5."
  },
  {
    "id": 19,
    "topic": "Equations and inequalities",
    "skill": "Linear equation with brackets",
    "level": "Foundation",
    "prompt": "Solve 3(x − 2) = 2x + 5.",
    "options": [
      "7",
      "9",
      "11",
      "13"
    ],
    "correct": 2,
    "explanation": "3x − 6 = 2x + 5, so x = 11."
  },
  {
    "id": 20,
    "topic": "Equations and inequalities",
    "skill": "Quadratic roots",
    "level": "Intermediate",
    "prompt": "What are all real solutions of x² − 5x + 6 = 0?",
    "options": [
      "x = −2 and −3",
      "x = 2 and 3",
      "x = 1 and 6",
      "x = −1 and −6"
    ],
    "correct": 1,
    "explanation": "Factor as (x − 2)(x − 3) = 0, giving x = 2 or x = 3."
  },
  {
    "id": 21,
    "topic": "Equations and inequalities",
    "skill": "Linear inequalities",
    "level": "Foundation",
    "prompt": "Solve the inequality 2x + 1 < 9.",
    "options": [
      "x > 4",
      "x ≤ 4",
      "x < 4",
      "x > −4"
    ],
    "correct": 2,
    "explanation": "Subtract 1 and divide by positive 2 to get x < 4."
  },
  {
    "id": 22,
    "topic": "Equations and inequalities",
    "skill": "Equations with fractions",
    "level": "Intermediate",
    "prompt": "Solve (x − 1)/3 = (x + 3)/5.",
    "options": [
      "x = 2",
      "x = 5",
      "x = 6",
      "x = 7"
    ],
    "correct": 3,
    "explanation": "Cross-multiplying gives 5x − 5 = 3x + 9. Thus 2x = 14, so x = 7."
  },
  {
    "id": 23,
    "topic": "Equations and inequalities",
    "skill": "Simultaneous equations",
    "level": "Intermediate",
    "prompt": "Solve x + y = 7 and x − y = 1.",
    "options": [
      "(x, y) = (4, 3)",
      "(x, y) = (3, 4)",
      "(x, y) = (5, 2)",
      "(x, y) = (6, 1)"
    ],
    "correct": 0,
    "explanation": "Adding equations yields 2x = 8, so x = 4; then y = 3. Both original equations hold."
  },
  {
    "id": 24,
    "topic": "Equations and inequalities",
    "skill": "Absolute-value equations",
    "level": "Intermediate",
    "prompt": "What are all real solutions of |2x − 3| = 5?",
    "options": [
      "x = 1 and 4",
      "x = −4 and 1",
      "x = −1 and 4",
      "x = −1 and −4"
    ],
    "correct": 2,
    "explanation": "Set 2x − 3 = 5 or 2x − 3 = −5. This gives x = 4 or x = −1."
  },
  {
    "id": 25,
    "topic": "Equations and inequalities",
    "skill": "Repeated quadratic root",
    "level": "Intermediate",
    "prompt": "Solve x² + 4x + 4 = 0.",
    "options": [
      "x = 2 only",
      "x = −2 only",
      "x = −4 or 0",
      "x = −2 or 2"
    ],
    "correct": 1,
    "explanation": "The expression is (x + 2)², which is zero only when x = −2."
  },
  {
    "id": 26,
    "topic": "Functions and graphs",
    "skill": "Evaluating a function",
    "level": "Foundation",
    "prompt": "If f(x) = 2x² − 3, find f(−2).",
    "options": [
      "−11",
      "−5",
      "5",
      "11"
    ],
    "correct": 2,
    "explanation": "f(−2) = 2(4) − 3 = 5."
  },
  {
    "id": 27,
    "topic": "Functions and graphs",
    "skill": "Domain of square root",
    "level": "Intermediate",
    "prompt": "For real values, what is the domain of g(x) = √(x − 3)?",
    "options": [
      "x > 3",
      "x ≥ 3",
      "x ≤ 3",
      "all real x"
    ],
    "correct": 1,
    "explanation": "The quantity under the square root must be non-negative: x − 3 ≥ 0, so x ≥ 3."
  },
  {
    "id": 28,
    "topic": "Functions and graphs",
    "skill": "Domain of rational function",
    "level": "Foundation",
    "prompt": "For h(x) = 1/(x + 2), which input is not allowed?",
    "options": [
      "x = −2",
      "x = 0",
      "x = 2",
      "x = −1"
    ],
    "correct": 0,
    "explanation": "At x = −2 the denominator becomes zero, so h is undefined."
  },
  {
    "id": 29,
    "topic": "Functions and graphs",
    "skill": "Slope from two points",
    "level": "Intermediate",
    "prompt": "Find the slope of the line through (1, 2) and (3, 8).",
    "options": [
      "2",
      "3",
      "4",
      "6"
    ],
    "correct": 1,
    "explanation": "Slope = (8 − 2)/(3 − 1) = 6/2 = 3."
  },
  {
    "id": 30,
    "topic": "Functions and graphs",
    "skill": "Y-intercept",
    "level": "Foundation",
    "prompt": "What is the y-intercept of y = −2x + 5?",
    "options": [
      "−2",
      "2",
      "−5",
      "5"
    ],
    "correct": 3,
    "explanation": "At the y-intercept x = 0. Substituting gives y = 5."
  },
  {
    "id": 31,
    "topic": "Functions and graphs",
    "skill": "Horizontal translation",
    "level": "Intermediate",
    "prompt": "Which function is the graph of y = x² shifted 3 units to the right?",
    "options": [
      "y = (x + 3)²",
      "y = x² + 3",
      "y = (x − 3)²",
      "y = x² − 3"
    ],
    "correct": 2,
    "explanation": "Replacing x with x − 3 shifts the graph three units to the right."
  },
  {
    "id": 32,
    "topic": "Functions and graphs",
    "skill": "Quadratic vertex",
    "level": "Intermediate",
    "prompt": "What is the vertex of y = (x + 1)² − 4?",
    "options": [
      "(1, −4)",
      "(−1, −4)",
      "(−1, 4)",
      "(1, 4)"
    ],
    "correct": 1,
    "explanation": "In vertex form y = (x − h)² + k, the vertex is (h, k) = (−1, −4)."
  },
  {
    "id": 33,
    "topic": "Functions and graphs",
    "skill": "Inverse functions",
    "level": "Stretch",
    "prompt": "If f(x) = 3x − 2 for all real x, find f⁻¹(x).",
    "options": [
      "(x − 2)/3",
      "3x + 2",
      "3/(x + 2)",
      "(x + 2)/3"
    ],
    "correct": 3,
    "explanation": "Let y = 3x − 2. Swap x and y, then solve: y = (x + 2)/3."
  },
  {
    "id": 34,
    "topic": "Exponents and logarithms",
    "skill": "Exponent rules",
    "level": "Foundation",
    "prompt": "Evaluate 2³ × 2⁻¹.",
    "options": [
      "2",
      "4",
      "8",
      "16"
    ],
    "correct": 1,
    "explanation": "With the same base, add powers: 2³ × 2⁻¹ = 2² = 4."
  },
  {
    "id": 35,
    "topic": "Exponents and logarithms",
    "skill": "Fractional exponents",
    "level": "Foundation",
    "prompt": "Find the positive value of 9^(1/2).",
    "options": [
      "1.5",
      "3",
      "4.5",
      "9"
    ],
    "correct": 1,
    "explanation": "An exponent of 1/2 means the principal square root: √9 = 3."
  },
  {
    "id": 36,
    "topic": "Exponents and logarithms",
    "skill": "Definition of logarithm",
    "level": "Intermediate",
    "prompt": "Evaluate log₂(32).",
    "options": [
      "4",
      "6",
      "5",
      "8"
    ],
    "correct": 2,
    "explanation": "Because 2⁵ = 32, log₂(32) = 5."
  },
  {
    "id": 37,
    "topic": "Exponents and logarithms",
    "skill": "Solving an exponential equation",
    "level": "Intermediate",
    "prompt": "Solve 3^(x + 1) = 81.",
    "options": [
      "x = 2",
      "x = 3",
      "x = 4",
      "x = 5"
    ],
    "correct": 1,
    "explanation": "81 = 3⁴, hence x + 1 = 4 and x = 3."
  },
  {
    "id": 38,
    "topic": "Exponents and logarithms",
    "skill": "Negative logarithms",
    "level": "Intermediate",
    "prompt": "Find log₁₀(0.01).",
    "options": [
      "−3",
      "−1",
      "2",
      "−2"
    ],
    "correct": 3,
    "explanation": "0.01 = 10⁻², so its base-10 logarithm is −2."
  },
  {
    "id": 39,
    "topic": "Exponents and logarithms",
    "skill": "Compound growth",
    "level": "Intermediate",
    "prompt": "A balance of $100 grows by 10% annually for 2 years. What is the balance after 2 years, without other transactions?",
    "options": [
      "$110",
      "$120",
      "$121",
      "$122"
    ],
    "correct": 2,
    "explanation": "Compound growth gives 100 × 1.1² = $121."
  },
  {
    "id": 40,
    "topic": "Trigonometry",
    "skill": "Special-angle sine",
    "level": "Intermediate",
    "prompt": "Evaluate sin(30°).",
    "options": [
      "0",
      "1/2",
      "√2/2",
      "√3/2"
    ],
    "correct": 1,
    "explanation": "In a 30°-60°-90° triangle, sin(30°) = 1/2."
  },
  {
    "id": 41,
    "topic": "Trigonometry",
    "skill": "Cosine on unit circle",
    "level": "Intermediate",
    "prompt": "Evaluate cos(π) where π is in radians.",
    "options": [
      "−1",
      "0",
      "1",
      "1/2"
    ],
    "correct": 0,
    "explanation": "At π radians (180°), the unit-circle x-coordinate is −1."
  },
  {
    "id": 42,
    "topic": "Trigonometry",
    "skill": "Special-angle tangent",
    "level": "Intermediate",
    "prompt": "Evaluate tan(45°).",
    "options": [
      "0",
      "√3",
      "1",
      "1/√3"
    ],
    "correct": 2,
    "explanation": "At 45°, sine and cosine are equal, so tan(45°) = sin(45°)/cos(45°) = 1."
  },
  {
    "id": 43,
    "topic": "Trigonometry",
    "skill": "Degrees to radians",
    "level": "Intermediate",
    "prompt": "Convert 150° to radians.",
    "options": [
      "2π/3",
      "5π/6",
      "3π/4",
      "7π/6"
    ],
    "correct": 1,
    "explanation": "Multiply degrees by π/180: 150π/180 = 5π/6."
  },
  {
    "id": 44,
    "topic": "Trigonometry",
    "skill": "Pythagorean identity",
    "level": "Intermediate",
    "prompt": "Which expression equals sin²(θ) + cos²(θ) for every real θ?",
    "options": [
      "0",
      "sin(2θ)",
      "2",
      "1"
    ],
    "correct": 3,
    "explanation": "The fundamental Pythagorean identity states sin²(θ) + cos²(θ) = 1."
  },
  {
    "id": 45,
    "topic": "Trigonometry",
    "skill": "Trigonometric equations",
    "level": "Stretch",
    "prompt": "For 0° ≤ θ < 360°, which are all solutions of cos(θ) = 0?",
    "options": [
      "θ = 0° and 180°",
      "θ = 90° only",
      "θ = 90° and 270°",
      "θ = 180° and 360°"
    ],
    "correct": 2,
    "explanation": "Cosine is the horizontal unit-circle coordinate, which is zero at 90° and 270° in this interval."
  },
  {
    "id": 46,
    "topic": "Precalculus and calculus bridge",
    "skill": "Average rate of change",
    "level": "Intermediate",
    "prompt": "For f(x) = x², find the average rate of change from x = 1 to x = 3.",
    "options": [
      "2",
      "3",
      "4",
      "6"
    ],
    "correct": 2,
    "explanation": "Average rate of change = (f(3) − f(1))/(3 − 1) = (9 − 1)/2 = 4."
  },
  {
    "id": 47,
    "topic": "Precalculus and calculus bridge",
    "skill": "Derivative of a power",
    "level": "Stretch",
    "prompt": "Differentiate f(x) = x³ with respect to x.",
    "options": [
      "f′(x) = x²",
      "f′(x) = 3x²",
      "f′(x) = 3x",
      "f′(x) = x⁴/4"
    ],
    "correct": 1,
    "explanation": "By the power rule, the derivative of x³ is 3x²."
  },
  {
    "id": 48,
    "topic": "Precalculus and calculus bridge",
    "skill": "Algebraic limit",
    "level": "Stretch",
    "prompt": "Evaluate lim as x → 2 of (x² − 4)/(x − 2).",
    "options": [
      "0",
      "2",
      "4",
      "The limit does not exist"
    ],
    "correct": 2,
    "explanation": "For x ≠ 2, the fraction equals x + 2. Its value approaches 4 as x approaches 2."
  },
  {
    "id": 49,
    "topic": "Precalculus and calculus bridge",
    "skill": "Arithmetic sequence",
    "level": "Intermediate",
    "prompt": "The sequence is 5, 9, 13, 17, ... . What is its 10th term?",
    "options": [
      "37",
      "39",
      "41",
      "45"
    ],
    "correct": 2,
    "explanation": "The common difference is 4; term 10 is 5 + (10 − 1) × 4 = 41."
  },
  {
    "id": 50,
    "topic": "Precalculus and calculus bridge",
    "skill": "Stationary points",
    "level": "Stretch",
    "prompt": "For f(x) = 2x² − 4x, at what x-value is the derivative zero?",
    "options": [
      "x = −1",
      "x = 0",
      "x = 2",
      "x = 1"
    ],
    "correct": 3,
    "explanation": "Differentiate: f′(x) = 4x − 4. Setting f′(x) = 0 yields x = 1."
  },
  {
    "id": 51,
    "topic": "Algebra and manipulation",
    "skill": "Rational equations and excluded values",
    "level": "Stretch",
    "prompt": "Solve (x + 1)/(x − 2) = 3 over the real numbers.",
    "options": [
      "x = 2",
      "x = 3",
      "x = 7/2",
      "No real solution"
    ],
    "correct": 2,
    "explanation": "Require x ≠ 2. Multiplying by x − 2 gives x + 1 = 3x − 6, so x = 7/2, which is allowed."
  },
  {
    "id": 52,
    "topic": "Algebra and manipulation",
    "skill": "Difference of cubes",
    "level": "Stretch",
    "prompt": "For x ≠ 2, simplify (x³ − 8)/(x − 2).",
    "options": [
      "x² − 2x + 4",
      "x² + 2x + 4",
      "x² + 4",
      "x² − 4"
    ],
    "correct": 1,
    "explanation": "Use x³ − 8 = (x − 2)(x² + 2x + 4). The factor x − 2 cancels where x ≠ 2."
  },
  {
    "id": 53,
    "topic": "Functions and graphs",
    "skill": "Rational inverse function",
    "level": "Stretch",
    "prompt": "If f(x) = (2x − 1)/(x + 3), which formula gives f⁻¹(x), with domain x ≠ 2?",
    "options": [
      "(x + 3)/(2x − 1)",
      "(3x − 1)/(x + 2)",
      "(1 + 3x)/(2 − x)",
      "(1 − 3x)/(x − 2)"
    ],
    "correct": 2,
    "explanation": "From y(x + 3) = 2x − 1, solve x(y − 2) = −1 − 3y and obtain x = (1 + 3y)/(2 − y)."
  },
  {
    "id": 54,
    "topic": "Functions and graphs",
    "skill": "Domain with radicals and fractions",
    "level": "Stretch",
    "prompt": "What is the real domain of g(x) = √(5 − 2x)/(x + 1)?",
    "options": [
      "x ≤ 5/2, excluding x = −1",
      "x ≥ 5/2, excluding x = −1",
      "x < 5/2, excluding x = −1",
      "All real x except −1"
    ],
    "correct": 0,
    "explanation": "The square-root input requires 5 − 2x ≥ 0, so x ≤ 5/2. The denominator also requires x ≠ −1."
  },
  {
    "id": 55,
    "topic": "Exponents and logarithms",
    "skill": "Logarithmic equation with domain",
    "level": "Stretch",
    "prompt": "For real x > 2, solve log₂(x) + log₂(x − 2) = 3.",
    "options": [
      "x = 2",
      "x = 3",
      "x = 4",
      "x = 8"
    ],
    "correct": 2,
    "explanation": "Combine logarithms: x(x − 2) = 2³ = 8. Thus (x − 4)(x + 2) = 0, and x > 2 leaves x = 4."
  },
  {
    "id": 56,
    "topic": "Trigonometry",
    "skill": "Quadratic trigonometric equation",
    "level": "Stretch",
    "prompt": "For 0 ≤ θ < 2π, find all solutions of 2sin²(θ) − 1 = 0.",
    "options": [
      "π/4 and 3π/4 only",
      "π/4, 3π/4, 5π/4, 7π/4",
      "π/2 and 3π/2 only",
      "0, π/2, π, 3π/2"
    ],
    "correct": 1,
    "explanation": "sin²(θ) = 1/2 means sin(θ) = ±√2/2. All four quadrants give the listed four angles."
  },
  {
    "id": 57,
    "topic": "Trigonometry",
    "skill": "Reference angles across quadrants",
    "level": "Stretch",
    "prompt": "For 0 ≤ θ < 2π, solve cos(θ) = −√3/2.",
    "options": [
      "π/6 and 11π/6",
      "π/3 and 5π/3",
      "2π/3 and 4π/3",
      "5π/6 and 7π/6"
    ],
    "correct": 3,
    "explanation": "The reference angle is π/6. Cosine is negative in quadrants II and III, so θ = 5π/6 or 7π/6."
  },
  {
    "id": 58,
    "topic": "Precalculus and calculus bridge",
    "skill": "Product rule for derivatives",
    "level": "Stretch",
    "prompt": "For x > 0, differentiate f(x) = x² ln(x).",
    "options": [
      "2x ln(x) + x",
      "2x ln(x) + x²",
      "x²/x",
      "2x/x + x²"
    ],
    "correct": 0,
    "explanation": "Apply the product rule: f′(x) = 2x ln(x) + x²(1/x) = 2x ln(x) + x."
  },
  {
    "id": 59,
    "topic": "Precalculus and calculus bridge",
    "skill": "Chain rule for derivatives",
    "level": "Stretch",
    "prompt": "Differentiate h(x) = (3x − 1)⁴.",
    "options": [
      "4(3x − 1)³",
      "12(3x − 1)⁴",
      "12(3x − 1)³",
      "3(3x − 1)⁴"
    ],
    "correct": 2,
    "explanation": "The chain rule gives 4(3x − 1)³ × 3 = 12(3x − 1)³."
  },
  {
    "id": 60,
    "topic": "Numerical fluency",
    "skill": "Independent-event probability",
    "level": "Stretch",
    "prompt": "Events A and B are independent. P(A) = 0.4 and P(B) = 0.5. What is P(A ∪ B)?",
    "options": [
      "0.2",
      "0.5",
      "0.7",
      "0.9"
    ],
    "correct": 2,
    "explanation": "For independent events P(A ∩ B) = 0.4 × 0.5 = 0.2. Then P(A ∪ B) = 0.4 + 0.5 − 0.2 = 0.7."
  }
];

# Semantic Model Threshold Reference

## Quick Threshold Guide

### Detection Thresholds (Score Required for Flagging)

| Scenario | Threshold | Example |
|----------|-----------|---------|
| **Critical/High Severity Words** | 0.18 | "kill yourself", "you're worthless" |
| **Strong Semantic + Personal** | 0.30 | "why are you even here?" |
| **Multiple Semantics + Personal** | 0.35 | "nobody asked, just leave" |
| **Medium Word + Personal (Short)** | 0.38 | "you're annoying" (≤8 words) |
| **Low Words + Personal (Short)** | 0.40 | "you're dumb and stupid" (≤6 words) |
| **Single Semantic + Personal** | 0.42 | "shut up" (with context) |
| **High Severity (No Personal)** | 0.48 | Generic toxic language |
| **Default** | 0.55 | Requires strong evidence |

### Severity Boost Values

| Word Severity | Boost Amount | Auto-Flag? |
|--------------|--------------|------------|
| **Critical** (1+ words) | 0.70 + (count × 0.15) | ✅ Yes |
| **High** (1+ words) | 0.45 + (count × 0.12) | ✅ Yes |
| **Medium** (2+ words) | 0.25 + (count × 0.08) | ✅ Yes |
| **Medium** (1 word + personal) | 0.25 | ✅ Yes |
| **Low** (2+ personal) | 0.25 | ❌ No (threshold decides) |
| **Low** (2+ non-personal) | 0.08 | ❌ No |
| **Low** (1 word + personal) | 0.10 | ❌ No |
| **Low** (1 word non-personal) | 0.05 | ❌ No |

### Risk Level Calculation

```
weightedRisk = (maxCategory × 0.65) + (avgScore × 0.35) + (semanticBoost × multiplier)

Semantic Boost Multipliers:
- Score > 0.85: 0.25
- Score > 0.70: 0.18
- Score > 0.50: 0.12
- Score > 0.30: 0.08
- Default: 0.05

riskLevel = min(100, round(weightedRisk × 100))
```

### Cyberbullying Detection Logic

```
isCyberbullying = 
  (riskLevel > 55 AND semanticBoost > 0.35) OR
  semanticBoost > 0.65 OR
  riskLevel > 70
```

### Confidence Calculation

**For Cyberbullying:**
```
baseConfidence = maxCategory × 0.75
categoryBonus = activeCategories × 0.08
semanticBonus = 
  - High (>0.7): 0.15
  - Medium (>0.4): 0.08
  - Low: 0.03

confidence = min(0.96, baseConfidence + categoryBonus + semanticBonus)
```

**For Safe Content:**
```
- Very Safe (maxCat < 0.05, semantic < 0.2): 0.95
- Safe (maxCat < 0.2, semantic < 0.35): 0.88
- Borderline: 0.75 - (maxCat × 0.3) - (semantic × 0.2), min 0.55
```

## Key Improvements Summary

✅ **Context-Aware**: Personal targeting matters  
✅ **Text Length**: Shorter texts need stronger signals  
✅ **Graduated Scoring**: Diminishing returns for multiple low signals  
✅ **Better Thresholds**: Reduced false positives  
✅ **Nuanced Confidence**: More realistic confidence scores  

## Example Classifications

### Will Flag as Cyberbullying ✅
- "You are stupid" (high severity + personal)
- "Kill yourself" (critical severity)
- "Why are you even here?" (semantic + personal)
- "Nobody likes you" (semantic + personal)
- "You're ugly and fat" (multiple medium + personal)

### Will NOT Flag ❌
- "I disagree with that" (no personal targeting)
- "That's not right" (mild, no severity)
- "This could be better" (constructive)
- "Are you serious?" (question, context matters)
- "That's crazy" (not personally directed)

### Borderline (Context-Dependent) ⚠️
- "Shut up" - Depends on context
- "You're crazy" - Casual vs. targeted
- "That's dumb" - Object vs. person
- "Nobody asked" - May flag if personally directed

---

**Last Updated:** December 1, 2025

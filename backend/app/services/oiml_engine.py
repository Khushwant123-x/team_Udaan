"""
OIML R 76-1:2006 Calculation Engine
Automated evaluation of Maximum Permissible Error (MPE) and compliance status for NAWI type approval.
"""

from typing import Dict, List, Any, Optional
from enum import Enum


class AccuracyClass(str, Enum):
    CLASS_I = "CLASS_I"      # Special (e.g. fine balances)
    CLASS_II = "CLASS_II"    # High (e.g. lab balances)
    CLASS_III = "CLASS_III"  # Medium (e.g. commercial scales, weighbridges)
    CLASS_IIII = "CLASS_IIII"# Ordinary (e.g. industrial bulk scales)


def get_mpe_in_e(load_in_e: float, accuracy_class: AccuracyClass) -> float:
    """
    Returns MPE expressed in terms of scale interval 'e' for initial verification as per OIML R 76-1 Table 6.
    """
    m = abs(load_in_e)
    
    if accuracy_class == AccuracyClass.CLASS_I:
        if m <= 50000:
            return 0.5
        elif m <= 200000:
            return 1.0
        else:
            return 1.5

    elif accuracy_class == AccuracyClass.CLASS_II:
        if m <= 5000:
            return 0.5
        elif m <= 20000:
            return 1.0
        else:
            return 1.5

    elif accuracy_class == AccuracyClass.CLASS_III:
        if m <= 500:
            return 0.5
        elif m <= 2000:
            return 1.0
        else:
            return 1.5

    elif accuracy_class == AccuracyClass.CLASS_IIII:
        if m <= 50:
            return 0.5
        elif m <= 200:
            return 1.0
        else:
            return 1.5

    # Default fallback
    return 1.5


def calculate_mpe(load: float, e: float, accuracy_class: AccuracyClass) -> float:
    """
    Calculates absolute MPE in mass unit (e.g. grams/kg) for given load and scale interval e.
    """
    if e <= 0:
        return 0.0
    load_in_e = load / e
    mpe_e = get_mpe_in_e(load_in_e, accuracy_class)
    return round(mpe_e * e, 6)


def evaluate_span_point(load: float, indication: float, e: float, accuracy_class: AccuracyClass, delta_l: float = 0.0) -> Dict[str, Any]:
    """
    Evaluates a single load point during Span / Linearity test.
    Calculates Error E and checks against MPE.
    """
    # If delta_l (small weight method) is provided: E = I + 0.5e - delta_l - L
    if delta_l > 0:
        error = indication + 0.5 * e - delta_l - load
    else:
        error = indication - load

    error = round(error, 6)
    mpe = calculate_mpe(load, e, accuracy_class)
    passed = abs(error) <= (mpe + 1e-9)

    return {
        "load": load,
        "indication": indication,
        "delta_l": delta_l,
        "error": error,
        "mpe": mpe,
        "status": "PASS" if passed else "FAIL"
    }


def evaluate_span_test(points: List[Dict[str, float]], e: float, accuracy_class: AccuracyClass) -> Dict[str, Any]:
    """
    Evaluates full span test (increasing and decreasing load points).
    """
    evaluated_points = []
    overall_pass = True

    for p in points:
        load = float(p.get("load", 0))
        indication = float(p.get("indication", 0))
        delta_l = float(p.get("delta_l", 0))

        res = evaluate_span_point(load, indication, e, accuracy_class, delta_l)
        evaluated_points.append(res)
        if res["status"] == "FAIL":
            overall_pass = False

    return {
        "points": evaluated_points,
        "status": "PASS" if overall_pass else "FAIL"
    }


def evaluate_repeatability_test(readings: List[float], load: float, e: float, accuracy_class: AccuracyClass) -> Dict[str, Any]:
    """
    Evaluates Repeatability test (minimum 3 readings at identical load).
    Maximum difference between any two readings must not exceed |MPE| for that load.
    """
    if not readings or len(readings) < 3:
        return {
            "readings": readings,
            "max_difference": 0.0,
            "mpe": calculate_mpe(load, e, accuracy_class),
            "status": "FAIL",
            "reason": "Minimum 3 readings required for repeatability test"
        }

    max_val = max(readings)
    min_val = min(readings)
    diff = round(max_val - min_val, 6)
    mpe = calculate_mpe(load, e, accuracy_class)
    passed = diff <= (mpe + 1e-9)

    return {
        "load": load,
        "readings": readings,
        "min_reading": min_val,
        "max_reading": max_val,
        "max_difference": diff,
        "mpe": mpe,
        "status": "PASS" if passed else "FAIL"
    }


def evaluate_eccentricity_test(positions: List[Dict[str, Any]], test_load: float, e: float, accuracy_class: AccuracyClass) -> Dict[str, Any]:
    """
    Evaluates Eccentric load test across 5 positions (Center, Front-Left, Front-Right, Back-Left, Back-Right).
    """
    evaluated = []
    overall_pass = True
    mpe = calculate_mpe(test_load, e, accuracy_class)

    for pos in positions:
        pos_name = pos.get("position", "Unknown")
        indication = float(pos.get("indication", 0))
        error = round(indication - test_load, 6)
        passed = abs(error) <= (mpe + 1e-9)

        if not passed:
            overall_pass = False

        evaluated.append({
            "position": pos_name,
            "indication": indication,
            "error": error,
            "mpe": mpe,
            "status": "PASS" if passed else "FAIL"
        })

    return {
        "test_load": test_load,
        "mpe": mpe,
        "positions": evaluated,
        "status": "PASS" if overall_pass else "FAIL"
    }


def evaluate_discrimination_test(base_load: float, e: float, indication_before: float, added_load: float, indication_after: float) -> Dict[str, Any]:
    """
    Evaluates Discrimination test.
    Placing 1.4e extra load on equilibrium instrument must cause unambiguous change of 1e.
    """
    change = round(indication_after - indication_before, 6)
    # Target change should be >= 1e for added_load = 1.4e
    passed = (added_load >= 1.0 * e) and (change >= 0.8 * e)

    return {
        "base_load": base_load,
        "indication_before": indication_before,
        "added_load": added_load,
        "indication_after": indication_after,
        "indication_change": change,
        "required_min_change": e,
        "status": "PASS" if passed else "FAIL"
    }


def evaluate_temperature_test(temp_records: List[Dict[str, Any]], e: float, accuracy_class: AccuracyClass) -> Dict[str, Any]:
    """
    Evaluates Temperature Effect test (at reference 20°C, min temp, max temp).
    Also checks zero-drift per 5°C <= 1e.
    """
    overall_pass = True
    evaluated_records = []

    for r in temp_records:
        temp = float(r.get("temperature", 20.0))
        zero_indication = float(r.get("zero_indication", 0.0))
        test_load = float(r.get("test_load", 0.0))
        load_indication = float(r.get("load_indication", test_load))

        error = round(load_indication - test_load, 6)
        mpe = calculate_mpe(test_load, e, accuracy_class)
        zero_err = abs(zero_indication)
        passed = (abs(error) <= (mpe + 1e-9)) and (zero_err <= (mpe + 1e-9))

        if not passed:
            overall_pass = False

        evaluated_records.append({
            "temperature": temp,
            "zero_indication": zero_indication,
            "test_load": test_load,
            "load_indication": load_indication,
            "error": error,
            "mpe": mpe,
            "status": "PASS" if passed else "FAIL"
        })

    return {
        "records": evaluated_records,
        "status": "PASS" if overall_pass else "FAIL"
    }


def evaluate_full_session(session_data: Dict[str, Any], instrument_specs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates all tests recorded in a session and determines overall pass/fail status.
    """
    e = float(instrument_specs.get("verification_scale_interval", 1.0))
    acc_class_str = instrument_specs.get("accuracy_class", "CLASS_III")
    try:
        acc_class = AccuracyClass(acc_class_str)
    except ValueError:
        acc_class = AccuracyClass.CLASS_III

    results = {}
    overall_pass = True

    # 1. Weighing Span Test
    if "span_test" in session_data:
        results["span_test"] = evaluate_span_test(session_data["span_test"].get("points", []), e, acc_class)
        if results["span_test"]["status"] == "FAIL":
            overall_pass = False

    # 2. Repeatability Test
    if "repeatability_test" in session_data:
        rep = session_data["repeatability_test"]
        results["repeatability_test"] = evaluate_repeatability_test(
            rep.get("readings", []), float(rep.get("load", 0)), e, acc_class
        )
        if results["repeatability_test"]["status"] == "FAIL":
            overall_pass = False

    # 3. Eccentricity Test
    if "eccentricity_test" in session_data:
        ecc = session_data["eccentricity_test"]
        results["eccentricity_test"] = evaluate_eccentricity_test(
            ecc.get("positions", []), float(ecc.get("test_load", 0)), e, acc_class
        )
        if results["eccentricity_test"]["status"] == "FAIL":
            overall_pass = False

    # 4. Discrimination Test
    if "discrimination_test" in session_data:
        disc = session_data["discrimination_test"]
        results["discrimination_test"] = evaluate_discrimination_test(
            float(disc.get("base_load", 0)),
            e,
            float(disc.get("indication_before", 0)),
            float(disc.get("added_load", 1.4 * e)),
            float(disc.get("indication_after", 0))
        )
        if results["discrimination_test"]["status"] == "FAIL":
            overall_pass = False

    # 5. Temperature Test
    if "temperature_test" in session_data:
        temp = session_data["temperature_test"]
        results["temperature_test"] = evaluate_temperature_test(
            temp.get("records", []), e, acc_class
        )
        if results["temperature_test"]["status"] == "FAIL":
            overall_pass = False

    # 6. Safety & Overload Check
    if "safety_test" in session_data:
        saf = session_data["safety_test"]
        overload_load = float(saf.get("overload_load", 0))
        max_cap = float(instrument_specs.get("max_capacity", 0))
        # Overload display must cut off at Max + 9e
        saf_passed = saf.get("blanked_on_overload", True) and (overload_load >= max_cap + 9 * e)
        results["safety_test"] = {
            "overload_load": overload_load,
            "max_capacity": max_cap,
            "blanked_on_overload": saf.get("blanked_on_overload", True),
            "status": "PASS" if saf_passed else "FAIL"
        }
        if not saf_passed:
            overall_pass = False

    return {
        "overall_status": "APPROVED" if overall_pass else "REJECTED",
        "accuracy_class": acc_class.value,
        "verification_interval_e": e,
        "test_results": results
    }

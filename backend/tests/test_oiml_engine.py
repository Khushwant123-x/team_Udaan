import pytest
from backend.app.services.oiml_engine import (
    AccuracyClass, calculate_mpe, evaluate_span_point, evaluate_repeatability_test, evaluate_eccentricity_test
)


def test_class_iii_mpe_calculation():
    # Class III: e = 5 g = 0.005 kg
    e = 0.005
    acc = AccuracyClass.CLASS_III

    # Load = 1 kg -> m/e = 200 (<= 500) -> MPE = 0.5e = 0.0025 kg
    assert calculate_mpe(1.0, e, acc) == 0.0025

    # Load = 5 kg -> m/e = 1000 (> 500, <= 2000) -> MPE = 1.0e = 0.005 kg
    assert calculate_mpe(5.0, e, acc) == 0.005

    # Load = 15 kg -> m/e = 3000 (> 2000) -> MPE = 1.5e = 0.0075 kg
    assert calculate_mpe(15.0, e, acc) == 0.0075


def test_span_point_evaluation_pass():
    e = 0.005
    acc = AccuracyClass.CLASS_III
    res = evaluate_span_point(load=5.0, indication=5.002, e=e, accuracy_class=acc)
    assert res["status"] == "PASS"
    assert res["error"] == 0.002
    assert res["mpe"] == 0.005


def test_span_point_evaluation_fail():
    e = 0.005
    acc = AccuracyClass.CLASS_III
    res = evaluate_span_point(load=5.0, indication=5.010, e=e, accuracy_class=acc)
    assert res["status"] == "FAIL"
    assert res["error"] == 0.010


def test_repeatability_test_pass():
    e = 0.005
    acc = AccuracyClass.CLASS_III
    readings = [5.000, 5.002, 5.001]
    res = evaluate_repeatability_test(readings, load=5.0, e=e, accuracy_class=acc)
    assert res["status"] == "PASS"
    assert res["max_difference"] == 0.002
    assert res["mpe"] == 0.005


def test_eccentricity_test_pass():
    e = 0.005
    acc = AccuracyClass.CLASS_III
    positions = [
        {"position": "Center", "indication": 5.000},
        {"position": "Front Left", "indication": 5.002},
        {"position": "Front Right", "indication": 5.001},
        {"position": "Back Left", "indication": 4.999},
        {"position": "Back Right", "indication": 5.000}
    ]
    res = evaluate_eccentricity_test(positions, test_load=5.0, e=e, accuracy_class=acc)
    assert res["status"] == "PASS"
    assert len(res["positions"]) == 5

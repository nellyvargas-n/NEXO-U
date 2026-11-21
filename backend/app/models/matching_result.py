"""Representación inmutable de un resultado de criterios calculados."""
from dataclasses import dataclass
@dataclass(frozen=True)
class MatchingResult:
    opportunity_id:int
    met:int
    total:int
    eligible:bool

@echo off
echo Training Tuberculosis Detection Model (DenseNet121 with class imbalance weighting)...
python -u -m ai_agent.training.train --dataset-dir ai_agent/dataset --epochs 5
pause

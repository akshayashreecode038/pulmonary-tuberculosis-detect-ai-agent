@echo off
echo Running Multi-Metric Clinical Evaluation on Test Set...
python -u -m ai_agent.training.evaluate --checkpoint ai_agent/models_ckpt/tb_densenet121_best.pt --test-dir ai_agent/dataset/test --threshold 0.45
pause

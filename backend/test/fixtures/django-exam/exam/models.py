from django.db import models

class Student(models.Model):
    name = models.CharField(max_length=120)
    roll = models.CharField(max_length=20)

class ExamPaper(models.Model):
    title = models.CharField(max_length=200)
    marks = models.IntegerField()

class Attempt(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    paper = models.ForeignKey(ExamPaper, on_delete=models.CASCADE)
    score = models.IntegerField()

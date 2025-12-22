---
title: Γ函数简单推导
date: 2021-11-10 16:57:10
tags: [数学分析]
categories: [Math]
---

$\Gamma$ 的简单且略微初等的推导方式,并不严谨但很直观

<!-- more -->

# $\Gamma$函数及其推导

$$
\newcommand{\dd}{\mathrm{d}}
\newcommand{\RA}{\Rightarrow}
\newcommand{\LRA}{\Leftrightarrow}
$$

我们来考察积分

$$\int^{+\infty}_0\frac{x^n}{e^x}\dd x \tag{1}$$

方便起见,这里我们暂时做出如下简写:$\displaystyle \ln^m(x):=(\ln(x))^m$  
我们观察可得

$$ \frac{\dd x}{e^x}=\dd\left(-\frac{1}{e^x}\right)=d(-e^{-x})$$

我们不妨令$t=-e^{-x}$,则$x=-\ln(-t)$,且有

$$\left\{\begin{matrix}
        x=0&\RA&t=-1\\\\
        x\to\infty&\RA&t\to 0
\end{matrix}\right.$$

则

$$(1)\LRA\int^0_{-1}(-\ln(-t))^n\dd t\LRA
    \begin{dcases}
        \int^0_{-1}\ln^{2h}(-t)\dd t\\\\
        \int^0_{-1}-\ln^{2h+1}(-t)\dd t
\end{dcases}$$

且有$\ln^{2h}(-t)\LRA\ln^{2h}(t);\ln^{2h+1}(-t)\LRA -\ln^{2h+1}(-t)$  
故可令$u=-t$,此时可化为

$$(1)\LRA\int^1_0\ln^n(u)\dd u$$

接下俩探究积分

$$\int\ln^n(x)\dd x$$

使用分部积分,得到:

$$\int\ln^n(x)\dd x=x\ln^n(x)-\int xd(\ln^n(x))$$

且有

$$\int xd(\ln^n(x))=n\int\ln^{n-1}(x)\dd x=\cdots$$

我们不妨令

$$f_n(x)=\int\ln^n(x)\dd x$$

则我们有

$$f_n(x)=x\ln^n(x)-nf_{x-1}(x)$$

当$x=1$时,有$x\ln^n(x)=0$  
当$x\to 0$时,由洛必达法则,我们有$\lim_{x\to 0}x\ln^n(x)=0$  
且通过迭代,即可得到

$$f_n(x)=x\ln^n(x)+n(x\ln^{n-1}(x)+(n-1)(x\ln^{n-2}(x)+(\dots 1\times(x\ln^0(x)))))=n!x+R_x$$

其中,当$x=1$或$x\to 0$时,$R_x$为无穷小,从而

$$(1)\LRA f_n(a)-f_n(0)=n!$$

即为我们想要的结果,我们记

$$\Gamma(n)=\int^{+\infty}_0 \frac{x^{n-1}}{\ee^x}\dd x=(n-1)!,\forall x\in\NN$$

称之为$\Gamma$函数/Gamma函数